import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  arrayUnion, 
  runTransaction,
  getDocs,
  getDocFromServer
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType, switchToDefaultDatabase } from "../firebase";
import { supabase, SUPABASE_ACTIVE } from "../supabase";
import { 
  UserProfile, 
  Organization, 
  Task, 
  CalendarEvent, 
  MessageChannel, 
  ChatMessage, 
  SystemNotification 
} from "../types";

// Connection Validation checklist requirement
async function testConnection() {
  try {
    await supabase.from("organizations").select("id").limit(1).maybeSingle();
    console.log("[Supabase Status] Connection validation successful.");
  } catch (error) {
    console.warn("[Supabase Status] Could not verify database connection:", error);
  }
}

interface AppContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  organization: Organization | null;
  members: UserProfile[];
  tasks: Task[];
  events: CalendarEvent[];
  channels: MessageChannel[];
  notifications: SystemNotification[];
  loading: boolean;
  authLoading: boolean;
  errorMsg: string | null;
  
  signUpEmail: (email: string, password: string, name: string, orgOption: "join" | "create", enteredOrgCode: string, newOrgName: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (fields: Partial<UserProfile>) => Promise<void>;
  upgradeToPremium: (cardNumber: string, expiry: string, cvc: string) => Promise<void>;
  
  createTask: (title: string, description: string, priority: "low" | "medium" | "high", category: "development" | "design" | "testing" | "documentation", assigneeId: string, dueDate: string) => Promise<void>;
  updateTask: (taskId: string, fields: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  createEvent: (title: string, description: string, date: string, time: string, endTime: string, type: "meeting" | "deadline" | "review" | "other", priority: "low" | "medium" | "high", attendees: string[]) => Promise<void>;
  updateEvent: (eventId: string, fields: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  sendDirectMessage: (recipientId: string, text: string) => Promise<void>;
  addSystemNotification: (title: string, description: string, type: "task" | "message" | "event" | "org") => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [channels, setChannels] = useState<MessageChannel[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Connection validation on initial boot
  useEffect(() => {
    testConnection();
  }, []);

  // Sync auth and real-time streams
  useEffect(() => {
    if (SUPABASE_ACTIVE) {
      setAuthLoading(true);

      const initSupabaseSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const mappedUser = { ...session.user, uid: session.user.id };
            setUser(mappedUser as any);
            setAuthLoading(false);
            setLoading(true);

            // Fetch profile
            const { data } = await supabase.from("users").select("*").eq("uid", session.user.id).maybeSingle();
            if (data) {
              setProfile(data as UserProfile);
            }
            setLoading(false);
          } else {
            setUser(null);
            setProfile(null);
            setAuthLoading(false);
            setLoading(false);
          }
        } catch (err) {
          console.error("Supabase Session Init Failed Check:", err);
          setAuthLoading(false);
          setLoading(false);
        }
      };
      
      initSupabaseSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const mappedUser = { ...session.user, uid: session.user.id };
          setUser(mappedUser as any);
          setAuthLoading(false);
          setLoading(true);

          const { data } = await supabase.from("users").select("*").eq("uid", session.user.id).maybeSingle();
          if (data) {
            setProfile(data as UserProfile);
          }
          setLoading(false);
        } else {
          setUser(null);
          setProfile(null);
          setOrganization(null);
          setMembers([]);
          setTasks([]);
          setEvents([]);
          setChannels([]);
          setAuthLoading(false);
          setLoading(false);
        }
      });

      // Subscribe to profile details table
      let profileChannel: any;
      if (user) {
        profileChannel = supabase.channel(`public:users:${user.uid}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `uid=eq.${user.uid}` }, (payload) => {
            if (payload.new) {
              setProfile(payload.new as UserProfile);
            }
          })
          .subscribe();
      }

      return () => {
        subscription.unsubscribe();
        if (profileChannel) profileChannel.unsubscribe();
      };
    } else {
      // ------------------------------------
      // FIREBASE AUTH & STREAM SYNC ENGINE
      // ------------------------------------
      const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
        
        if (!currentUser) {
          setProfile(null);
          setOrganization(null);
          setMembers([]);
          setTasks([]);
          setEvents([]);
          setChannels([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        
        // Load user profile via real-time Listener (onSnapshot)
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (!snapshot.exists()) {
            setLoading(false);
            return;
          }
          const profileData = snapshot.data() as UserProfile;
          setProfile({ ...profileData, uid: currentUser.uid });
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });

        return () => unsubscribeProfile();
      });

      return () => unsubscribeAuth();
    }
  }, [user?.uid]);

  // Listen for Organization-based collections when profile details exist
  useEffect(() => {
    if (!user || !profile?.orgCode) {
      setOrganization(null);
      setMembers([]);
      setTasks([]);
      setEvents([]);
      setChannels([]);
      return;
    }

    const orgCode = profile.orgCode;

    if (SUPABASE_ACTIVE) {
      // 1. Sync structures
      const fetchOrg = async () => {
        const { data } = await supabase.from("organizations").select("*").eq("id", orgCode).maybeSingle();
        if (data) {
          setOrganization(data as Organization);
        }
      };
      fetchOrg();
      const orgChannel = supabase.channel(`public:organizations:${orgCode}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "organizations", filter: `id=eq.${orgCode}` }, (payload) => {
          if (payload.new) {
            setOrganization(payload.new as Organization);
          }
        })
        .subscribe();

      // 2. Sync participants
      const fetchMembers = async () => {
        const { data } = await supabase.from("users").select("*").eq("orgCode", orgCode);
        if (data) {
          setMembers(data as UserProfile[]);
        }
      };
      fetchMembers();
      const membersChannel = supabase.channel(`public:users:org:${orgCode}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `orgCode=eq.${orgCode}` }, () => {
          fetchMembers();
        })
        .subscribe();

      // 3. Sync agile cards tasks
      const fetchTasks = async () => {
        const { data } = await supabase.from("tasks").select("*").eq("orgId", orgCode);
        if (data) {
          const sorted = (data as Task[]).sort((a, b) => b.createdat.localeCompare(a.createdat));
          setTasks(sorted);
        }
      };
      fetchTasks();
      const tasksChannel = supabase.channel(`public:tasks:org:${orgCode}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `orgId=eq.${orgCode}` }, () => {
          fetchTasks();
        })
        .subscribe();

      // 4. Sync events calendar
      const fetchEvents = async () => {
        const { data } = await supabase.from("calendar_events").select("*").eq("orgId", orgCode);
        if (data) {
          const sorted = (data as CalendarEvent[]).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
          setEvents(sorted);
        }
      };
      fetchEvents();
      const eventsChannel = supabase.channel(`public:calendar_events:org:${orgCode}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "calendar_events", filter: `orgId=eq.${orgCode}` }, () => {
          fetchEvents();
        })
        .subscribe();

      // 5. Sync chat channels
      const fetchChannels = async () => {
        const { data } = await supabase.from("messages").select("*").eq("orgId", orgCode);
        if (data) {
          const filtered = (data as MessageChannel[]).filter(chan => chan.participants.includes(user.uid));
          setChannels(filtered);
        }
      };
      fetchChannels();
      const messagesChannel = supabase.channel(`public:messages:org:${orgCode}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `orgId=eq.${orgCode}` }, () => {
          fetchChannels();
        })
        .subscribe();

      return () => {
        orgChannel.unsubscribe();
        membersChannel.unsubscribe();
        tasksChannel.unsubscribe();
        eventsChannel.unsubscribe();
        messagesChannel.unsubscribe();
      };
    } else {
      // 1. Subscribe to organization settings
      const orgDocRef = doc(db, "organizations", orgCode);
      const unsubscribeOrg = onSnapshot(orgDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setOrganization({ id: snapshot.id, ...snapshot.data() } as Organization);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `organizations/${orgCode}`);
      });

      // 2. Subscribe to members in this organization (same orgCode)
      const membersQuery = query(collection(db, "users"), where("orgCode", "==", orgCode));
      const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
        const parsed: UserProfile[] = [];
        snapshot.forEach((d) => {
          parsed.push({ uid: d.id, ...d.data() } as UserProfile);
        });
        setMembers(parsed);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "users");
      });

      // 3. Subscribe to tasks in this organization
      const tasksQuery = query(collection(db, "tasks"), where("orgId", "==", orgCode));
      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const parsed: Task[] = [];
        snapshot.forEach((d) => {
          parsed.push(d.data() as Task);
        });
        // Sort tasks: default by creation or state
        parsed.sort((a, b) => b.createdat.localeCompare(a.createdat));
        setTasks(parsed);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "tasks");
      });

      // 4. Subscribe to calendar events in this org
      const eventsQuery = query(collection(db, "calendar_events"), where("orgId", "==", orgCode));
      const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
        const parsed: CalendarEvent[] = [];
        snapshot.forEach((d) => {
          parsed.push(d.data() as CalendarEvent);
        });
        // Sort upcoming
        parsed.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
        setEvents(parsed);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "calendar_events");
      });

      // 5. Subscribe to message channels in this organization
      const channelsQuery = query(
        collection(db, "messages"),
        where("orgId", "==", orgCode),
        where("participants", "array-contains", user.uid)
      );
      const unsubscribeChannels = onSnapshot(channelsQuery, (snapshot) => {
        const parsed: MessageChannel[] = [];
        snapshot.forEach((d) => {
          parsed.push(d.data() as MessageChannel);
        });
        setChannels(parsed);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      });

      return () => {
        unsubscribeOrg();
        unsubscribeMembers();
        unsubscribeTasks();
        unsubscribeEvents();
        unsubscribeChannels();
      };
    }
  }, [user?.uid, profile?.orgCode]);

  // Handle local notification list
  const addSystemNotification = (title: string, description: string, type: "task" | "message" | "event" | "org") => {
    const notify: SystemNotification = {
      id: Math.random().toString(36).substring(2),
      title,
      description,
      type,
      read: false,
      createdat: new Date().toISOString()
    };
    setNotifications((prev) => [notify, ...prev].slice(0, 30));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  // Auth Functions
  const signUpEmail = async (
    email: string, 
    password: string, 
    name: string, 
    orgOption: "join" | "create", 
    enteredOrgCode: string, 
    newOrgName: string
  ) => {
    setErrorMsg(null);
    try {
      let finalOrgCode = "";

      if (orgOption === "join") {
        if (!enteredOrgCode) {
          throw new Error("Organization Code is required for joining an existing workspace.");
        }
        
        const parsedCode = enteredOrgCode.trim().toUpperCase();
        
        if (SUPABASE_ACTIVE) {
          const { data: orgSnapshot } = await supabase.from("organizations").select("*").eq("id", parsedCode).maybeSingle();
          if (!orgSnapshot) {
            throw new Error(`The workspace code "${parsedCode}" was not found. Please verify the code.`);
          }
        } else {
          const checkOrgExists = async () => {
            const orgDocRef = doc(db, "organizations", parsedCode);
            return await getDoc(orgDocRef);
          };

          let orgSnapshot;
          try {
            orgSnapshot = await checkOrgExists();
          } catch (getErr: any) {
            if (getErr?.message?.includes("Invalid path specified in request URL")) {
              console.warn("[Firebase AppContext] Org check failed; retrying with (default) database.");
              switchToDefaultDatabase();
              orgSnapshot = await checkOrgExists();
            } else {
              throw getErr;
            }
          }

          if (!orgSnapshot.exists()) {
            throw new Error(`The workspace code "${parsedCode}" was not found. Please verify the code.`);
          }
        }
        
        finalOrgCode = parsedCode;
      } else {
        if (!newOrgName) {
          throw new Error("Workspace name is required to create a new workspace.");
        }
        const randId = Math.random().toString(36).substring(2, 8).toUpperCase();
        finalOrgCode = `OPEN-${randId}`;
      }

      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

      if (SUPABASE_ACTIVE) {
        // 1. Create supabase Auth account
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { displayName: name }
          }
        });
        if (authErr) throw authErr;
        const uid = authData.user?.id;
        if (!uid) throw new Error("Supabase Auth failed to respond with user ID");

        const profilePayload: UserProfile = {
          uid,
          email,
          name,
          orgCode: finalOrgCode,
          avatar: avatarUrl,
          bio: "",
          phone: "",
          jobTitle: orgOption === "create" ? "Workspace Owner" : "Team Participant",
          isPremium: false,
          paymentStatus: "free",
          createdat: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // 2. Add member to Organization
        if (orgOption === "create") {
          const newOrgPayload: Organization = {
            id: finalOrgCode,
            orgCode: finalOrgCode,
            name: newOrgName,
            ownerId: uid,
            members: [uid],
            createdat: new Date().toISOString()
          };
          const { error: orgErr } = await supabase.from("organizations").insert(newOrgPayload);
          if (orgErr) throw orgErr;
        } else {
          const { data: orgData } = await supabase.from("organizations").select("*").eq("id", finalOrgCode).single();
          const pMembers = orgData?.members || [];
          const { error: orgErr } = await supabase.from("organizations")
            .update({ members: [...pMembers, uid] })
            .eq("id", finalOrgCode);
          if (orgErr) throw orgErr;
        }

        // 3. Save profile in DB
        const { error: profileErr } = await supabase.from("users").insert(profilePayload);
        if (profileErr) throw profileErr;

        addSystemNotification("Welcome to OpenColab!", `Signed up successfully with workspace ${finalOrgCode}`, "org");
      } else {
        // 1. Create firebase user auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const profilePayload: UserProfile = {
          uid,
          email,
          name,
          orgCode: finalOrgCode,
          avatar: avatarUrl,
          bio: "",
          phone: "",
          jobTitle: orgOption === "create" ? "Workspace Owner" : "Team Participant",
          isPremium: false,
          paymentStatus: "free",
          createdat: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // 2. Perform Atomic transaction to bind User to Organization safely with automatic fallback support
        const performDatabaseWrites = async () => {
          if (orgOption === "create") {
            const newOrgPayload: Organization = {
              id: finalOrgCode,
              orgCode: finalOrgCode,
              name: newOrgName,
              ownerId: uid,
              members: [uid],
              createdat: new Date().toISOString()
            };

            await setDoc(doc(db, "organizations", finalOrgCode), newOrgPayload);
          } else {
            // Update members array inside existing Organization doc
            await updateDoc(doc(db, "organizations", finalOrgCode), {
              members: arrayUnion(uid)
            });
          }

          // 3. Save user profile document
          await setDoc(doc(db, "users", uid), profilePayload);
        };

        try {
          await performDatabaseWrites();
        } catch (dbErr: any) {
          const dbErrMsg = dbErr?.message || String(dbErr);
          if (dbErrMsg.includes("Invalid path specified in request URL")) {
            console.warn("[Firebase AppContext] Database write failed due to invalid path; switching to (default) and retrying writes...");
            switchToDefaultDatabase();
            await performDatabaseWrites();
          } else {
            throw dbErr;
          }
        }

        addSystemNotification("Welcome to OpenColab!", `Signed up successfully with workspace ${finalOrgCode}`, "org");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during authentication setup.");
      throw err;
    }
  };

  const signInEmail = async (email: string, password: string) => {
    setErrorMsg(null);
    try {
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      addSystemNotification("Welcome Back!", "Logged in successfully to workspace", "org");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Email or password incorrect.");
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      if (SUPABASE_ACTIVE) {
        await supabase.auth.signOut();
      } else {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserProfile = async (fields: Partial<UserProfile>) => {
    if (!user) return;
    try {
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("users")
          .update({ ...fields, updatedAt: new Date().toISOString() })
          .eq("uid", user.uid);
        if (error) throw error;
      } else {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          ...fields,
          updatedAt: new Date().toISOString()
        });
      }
      addSystemNotification("Profile Updated", "Your information was successfully synced.", "org");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase Error Update User Profile:", err);
      } else {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  const upgradeToPremium = async (cardNumber: string, expiry: string, cvc: string) => {
    if (!user || !profile) return;
    try {
      if (!cardNumber || cardNumber.length < 12 || !expiry || !cvc) {
        throw new Error("Invalid checkout credentials details.");
      }
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("users")
          .update({
            isPremium: true,
            paymentStatus: "paid",
            updatedAt: new Date().toISOString()
          })
          .eq("uid", user.uid);
        if (error) throw error;
      } else {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          isPremium: true,
          paymentStatus: "paid",
          updatedAt: new Date().toISOString()
        });
      }
      addSystemNotification("Premium Unlocked", "You are now unlocked with Unlimited access!", "org");
    } catch (err: any) {
      setErrorMsg(err.message || "Payment Processing Failed.");
      throw err;
    }
  };

  // Task Operations
  const createTask = async (
    title: string, 
    description: string, 
    priority: "low" | "medium" | "high", 
    category: "development" | "design" | "testing" | "documentation", 
    assigneeId: string, 
    dueDate: string
  ) => {
    if (!user || !profile) return;
    
    if (!profile.isPremium) {
      const ownCreatedCount = tasks.filter(t => t.createdBy === user.uid).length;
      if (ownCreatedCount >= 5) {
        throw new Error("Free limit reached. Workspace is limited to 5 tasks. Upgrade to Premium to add unlimited tasks!");
      }
    }

    try {
      const taskId = Math.random().toString(36).substring(2, 15);
      const assignee = members.find(m => m.uid === assigneeId);
      
      const payload: Task = {
        id: taskId,
        title,
        description,
        status: "pending",
        priority,
        category,
        assigneeId,
        assigneeName: assignee ? assignee.name : "Unassigned",
        assigneeAvatar: assignee ? assignee.avatar : "",
        createdBy: user.uid,
        dueDate,
        orgId: profile.orgCode,
        createdat: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("tasks").insert(payload);
        if (error) throw error;
      } else {
        await setDoc(doc(db, "tasks", taskId), payload);
      }
      addSystemNotification("Task Created", `New task "${title}" assigned within workspace.`, "task");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase error createTask:", err);
      } else {
        handleFirestoreError(err, OperationType.WRITE, `tasks`);
      }
    }
  };

  const updateTask = async (taskId: string, fields: Partial<Task>) => {
    try {
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("tasks")
          .update({ ...fields, updatedAt: new Date().toISOString() })
          .eq("id", taskId);
        if (error) throw error;
      } else {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
          ...fields,
          updatedAt: new Date().toISOString()
        });
      }
      addSystemNotification("Task Modified", "A workspace task has been updated.", "task");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase updateTask error:", err);
      } else {
        handleFirestoreError(err, OperationType.WRITE, `tasks/${taskId}`);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) throw error;
      } else {
        await deleteDoc(doc(db, "tasks", taskId));
      }
      addSystemNotification("Task Deleted", "A task was deleted from organization space.", "task");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase deleteTask fatal:", err);
      } else {
        handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
      }
    }
  };

  // Event Operations
  const createEvent = async (
    title: string, 
    description: string, 
    date: string, 
    time: string, 
    endTime: string, 
    type: "meeting" | "deadline" | "review" | "other", 
    priority: "low" | "medium" | "high", 
    attendees: string[]
  ) => {
    if (!user || !profile) return;

    if (!profile.isPremium) {
      const ownCreatedEvents = events.filter(e => e.createdBy === user.uid).length;
      if (ownCreatedEvents >= 3) {
        throw new Error("Free tier limit reached. You can only schedule 3 events. Upgrade to Premium for infinite schedules!");
      }
    }

    try {
      const eventId = Math.random().toString(36).substring(2, 15);
      const payload: CalendarEvent = {
        id: eventId,
        title,
        description,
        date,
        time,
        endTime,
        type,
        priority,
        createdBy: user.uid,
        attendees,
        orgId: profile.orgCode,
        createdat: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("calendar_events").insert(payload);
        if (error) throw error;
      } else {
        await setDoc(doc(db, "calendar_events", eventId), payload);
      }
      addSystemNotification("Event Added", `"${title}" has been added to team calendar.`, "event");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase createEvent error:", err);
      } else {
        handleFirestoreError(err, OperationType.WRITE, "calendar_events");
      }
    }
  };

  const updateEvent = async (eventId: string, fields: Partial<CalendarEvent>) => {
    try {
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("calendar_events")
          .update({ ...fields, updatedAt: new Date().toISOString() })
          .eq("id", eventId);
        if (error) throw error;
      } else {
        await updateDoc(doc(db, "calendar_events", eventId), {
          ...fields,
          updatedAt: new Date().toISOString()
        });
      }
      addSystemNotification("Event Updated", `Calendar slot changed.`, "event");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase updateEvent error:", err);
      } else {
        handleFirestoreError(err, OperationType.WRITE, `calendar_events/${eventId}`);
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      if (SUPABASE_ACTIVE) {
        const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);
        if (error) throw error;
      } else {
        await deleteDoc(doc(db, "calendar_events", eventId));
      }
      addSystemNotification("Event Canceled", "Calendar event was removed.", "event");
    } catch (err) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase deleteEvent error:", err);
      } else {
        handleFirestoreError(err, OperationType.DELETE, `calendar_events/${eventId}`);
      }
    }
  };

  // Messaging/Direct Chats
  const sendDirectMessage = async (recipientId: string, text: string) => {
    if (!user || !profile) return;
    setErrorMsg(null);
    try {
      const participants = [user.uid, recipientId].sort();
      const conversationId = participants.join("_");

      const newMessagePayload: ChatMessage = {
        senderId: user.uid,
        text,
        timestamp: Date.now()
      };

      if (SUPABASE_ACTIVE) {
        const { data: chanData, error: fetchErr } = await supabase.from("messages")
          .select("*")
          .eq("id", conversationId)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!chanData) {
          const payload: MessageChannel = {
            id: conversationId,
            participants,
            orgId: profile.orgCode,
            messages: [newMessagePayload],
            createdat: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const { error: insErr } = await supabase.from("messages").insert(payload);
          if (insErr) throw insErr;
        } else {
          const currentMsgs = chanData.messages || [];
          const { error: updErr } = await supabase.from("messages")
            .update({
              messages: [...currentMsgs, newMessagePayload],
              updatedAt: new Date().toISOString()
            })
            .eq("id", conversationId);
          if (updErr) throw updErr;
        }
      } else {
        const ref = doc(db, "messages", conversationId);
        const docSnapshot = await getDoc(ref);

        if (!docSnapshot.exists()) {
          const payload: MessageChannel = {
            id: conversationId,
            participants,
            orgId: profile.orgCode,
            messages: [newMessagePayload],
            createdat: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(ref, payload);
        } else {
          await updateDoc(ref, {
            messages: arrayUnion(newMessagePayload),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      if (SUPABASE_ACTIVE) {
        console.error("Supabase sendDirectMessage error:", err);
      } else {
        handleFirestoreError(err, OperationType.WRITE, "messages");
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      profile,
      organization,
      members,
      tasks,
      events,
      channels,
      notifications,
      loading,
      authLoading,
      errorMsg,
      
      signUpEmail,
      signInEmail,
      signOutUser,
      updateUserProfile,
      upgradeToPremium,
      
      createTask,
      updateTask,
      deleteTask,
      
      createEvent,
      updateEvent,
      deleteEvent,
      
      sendDirectMessage,
      addSystemNotification,
      clearNotifications,
      markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
}
