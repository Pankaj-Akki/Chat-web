import { useEffect, useMemo, useState } from 'react';
import './App.css';

const INITIAL_USERS = [
  {
    id: 'komal',
    username: 'Komal Jangra',
    password: 'Komal@123',
    displayName: 'Komal',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60',
    status: 'Online',
  },
  {
    id: 'pankaj',
    username: 'Pankaj Berwal',
    password: 'Pankaj@123',
    displayName: 'Pankaj',
    avatar:
      'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&w=200&q=60',
    status: 'Online',
  },
];

const STORAGE_KEY = 'guftagu-chat-messages';
const USER_COOKIE = 'guftagu_user';
const NOTIF_PREF_KEY = 'guftagu-notifications';
const THEME_KEY = 'guftagu-theme';
const MODE_KEY = 'guftagu-mode';
const CHAT_WALLPAPER = `${process.env.PUBLIC_URL || ''}/pexels-francesco-ungaro-998641.jpg`;

const THEMES = [
  {
    id: 'mint',
    name: 'Mint',
    topbar: 'linear-gradient(135deg, #c8ffb5, #3ec47a)',
    bubbleSelf: '#c8ffb5',
    bubbleThem: '#f1fff2',
    composer: '#c8ffb5',
    accent: '#3ec47a',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    topbar: 'linear-gradient(135deg, #f7c2c9, #d3507a)',
    bubbleSelf: '#fbd5dc',
    bubbleThem: '#fff5f7',
    composer: '#f7c2c9',
    accent: '#d3507a',
  },
  {
    id: 'aqua',
    name: 'Aqua',
    topbar: 'linear-gradient(135deg, #a4ffe4, #28d7c2)',
    bubbleSelf: '#a4ffe4',
    bubbleThem: '#e5fff7',
    composer: '#a4ffe4',
    accent: '#1fb7a3',
  },
  {
    id: 'violet',
    name: 'Violet',
    topbar: 'linear-gradient(135deg, #9aa2ff, #7a4bff)',
    bubbleSelf: '#cdd2ff',
    bubbleThem: '#f2f3ff',
    composer: '#b2b9ff',
    accent: '#7a4bff',
  },
  {
    id: 'sky',
    name: 'Sky',
    topbar: 'linear-gradient(135deg, #a7e8ff, #39b6ff)',
    bubbleSelf: '#bfeaff',
    bubbleThem: '#eef9ff',
    composer: '#a7e8ff',
    accent: '#39b6ff',
  },
  {
    id: 'orchid',
    name: 'Orchid',
    topbar: 'linear-gradient(135deg, #f7b4ff, #b23bff)',
    bubbleSelf: '#f5d5ff',
    bubbleThem: '#fff6ff',
    composer: '#f7b4ff',
    accent: '#b23bff',
  },
];

const MODES = {
  dark: {
    id: 'dark',
    name: 'Dark',
    bg: '#0b1020',
    text: '#e9edf5',
    muted: '#c5cad5',
    card: '#0f172a',
    panel: '#111a30',
    border: '#1f2a44',
    hover: 'rgba(255, 255, 255, 0.06)',
    input: '#0b1020',
    authBg: 'radial-gradient(circle at 20% 20%, #18233a, #0b1020 60%)',
  },
  light: {
    id: 'light',
    name: 'Light',
    bg: '#f5f7fb',
    text: '#0f172a',
    muted: '#4e555c',
    card: '#ffffff',
    panel: '#f3f5f9',
    border: '#d6dbe4',
    hover: 'rgba(0, 0, 0, 0.05)',
    input: '#ffffff',
    authBg: 'radial-gradient(circle at 20% 20%, #ffffff, #f2f4f8 70%)',
  },
};

const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '🥹',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😜',
  '🤗',
  '🤝',
  '👍',
  '👋',
  '🙌',
  '👏',
  '🤔',
  '🤩',
  '🥳',
  '😎',
  '🤯',
  '🥺',
  '😇',
  '😴',
  '🤤',
  '😷',
  '🤒',
  '🤕',
  '🤧',
  '🥶',
  '🥵',
  '🤠',
  '🤡',
  '👀',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '🤍',
  '🤎',
  '💯',
  '✨',
  '🔥',
  '🌟',
  '🌙',
  '⭐',
  '☕',
  '🍕',
  '🎉',
  '🎁',
];

function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState({});
  const [draftMessage, setDraftMessage] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(NOTIF_PREF_KEY) === 'true';
    } catch (error) {
      return false;
    }
  });
  const [themeId, setThemeId] = useState(() => {
    if (typeof window === 'undefined') return THEMES[0].id;
    return localStorage.getItem(THEME_KEY) || THEMES[0].id;
  });
  const [modeId, setModeId] = useState(() => {
    if (typeof window === 'undefined') return MODES.light.id;
    return localStorage.getItem(MODE_KEY) || MODES.light.id;
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loggedInUser = useMemo(
    () => users.find((u) => u.id === loggedInUserId) || null,
    [users, loggedInUserId],
  );

  const activeChatUser = useMemo(
    () => users.find((u) => u.id === activeChatUserId) || null,
    [users, activeChatUserId],
  );
  const activeTheme = useMemo(
    () => THEMES.find((t) => t.id === themeId) || THEMES[0],
    [themeId],
  );
  const activeMode = useMemo(
    () => MODES[modeId] || MODES.dark,
    [modeId],
  );

  const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const getCookie = (name) => {
    return document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (error) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const savedUser = getCookie(USER_COOKIE);
    if (savedUser && INITIAL_USERS.some((u) => u.id === savedUser)) {
      setLoggedInUserId(savedUser);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    setIsSidebarOpen(!mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_PREF_KEY, notificationsEnabled ? 'true' : 'false');
    } catch (error) {
      // ignore storage errors
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, themeId);
    } catch (error) {
      // ignore storage errors
    }
  }, [themeId]);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, modeId);
    } catch (error) {
      // ignore storage errors
    }
  }, [modeId]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const channel = new BroadcastChannel('guftagu-chat');
    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'message' && payload?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      }
    };
    return () => channel.close();
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue);
        setMessages((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
      } catch (error) {
        // ignore parse errors
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!loggedInUser && activeChatUserId) {
      setActiveChatUserId(null);
    }
  }, [loggedInUser, activeChatUserId]);

  useEffect(() => {
    if (!loggedInUser) return;
    const otherUser = users.find((u) => u.id !== loggedInUser.id);
    if (otherUser && !activeChatUserId) {
      setActiveChatUserId(otherUser.id);
    }
  }, [loggedInUser, users, activeChatUserId]);

  useEffect(() => {
    if (!loggedInUser) return;
    if (!('Notification' in window)) return;
    if (notificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission().then((result) => {
        setNotificationsEnabled(result === 'granted');
      });
    }
  }, [loggedInUser, notificationsEnabled]);

  useEffect(() => {
    if (!draftMessage) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const timeout = setTimeout(() => setIsTyping(false), 1200);
    return () => clearTimeout(timeout);
  }, [draftMessage]);

  const handleLogin = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username').trim();
    const password = formData.get('password').trim();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.password !== password) {
      setLoginError('Use the correct username & password for Komal or Pankaj.');
      return;
    }
    setLoginError('');
    setLoggedInUserId(user.id);
    setCookie(USER_COOKIE, user.id);
    if (notificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission().then((result) => {
        setNotificationsEnabled(result === 'granted');
      });
    }
  };

  const handleSend = () => {
    if (!draftMessage.trim() || !loggedInUser || !activeChatUser) return;
    const timestamp = new Date().toISOString();
    const newMessage = {
      id: `${timestamp}-${Math.random()}`,
      from: loggedInUser.id,
      to: activeChatUser.id,
      text: draftMessage.trim(),
      timestamp,
    };
    setMessages((prev) => [...prev, newMessage]);
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('guftagu-chat');
      channel.postMessage({ type: 'message', payload: newMessage });
      channel.close();
    }
    setDraftMessage('');
    setShowEmojiPicker(false);
  };

  const handleReact = (messageId, emoji) => {
    if (!loggedInUser) return;
    setReactions((prev) => ({
      ...prev,
      [messageId]: {
        ...(prev[messageId] || {}),
        [loggedInUser.id]: emoji,
      },
    }));
  };

  useEffect(() => {
    if (!loggedInUser || !notificationsEnabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const last = messages[messages.length - 1];
    if (!last || last.to !== loggedInUser.id || last.from === loggedInUser.id) return;
    const sender = users.find((u) => u.id === last.from);
    new Notification(sender ? `${sender.displayName} sent a message` : 'New message', {
      body: last.text,
      icon: sender?.avatar,
    });
  }, [messages, loggedInUser, notificationsEnabled, users]);

  const conversation = useMemo(() => {
    if (!loggedInUser || !activeChatUser) return [];
    return messages.filter(
      (msg) =>
        (msg.from === loggedInUser.id && msg.to === activeChatUser.id) ||
        (msg.from === activeChatUser.id && msg.to === loggedInUser.id),
    );
  }, [messages, loggedInUser, activeChatUser]);

  const handleLogout = () => {
    setLoggedInUserId(null);
    setActiveChatUserId(null);
    setDraftMessage('');
    setShowDashboard(false);
    setShowEmojiPicker(false);
    deleteCookie(USER_COOKIE);
  };

  const updateProfile = ({ displayName, avatar }) => {
    if (!loggedInUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === loggedInUser.id
          ? {
              ...user,
              displayName: displayName || user.displayName,
              avatar: avatar || user.avatar,
            }
          : user,
      ),
    );
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateProfile({ avatar: e.target?.result });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = (event) => {
    event.preventDefault();
    if (!loggedInUser) return;
    const formData = new FormData(event.target);
    const current = formData.get('currentPassword').trim();
    const next = formData.get('newPassword').trim();
    const confirm = formData.get('confirmPassword').trim();

    if (!current || !next || !confirm) {
      setPasswordError('All fields are required.');
      setPasswordSuccess('');
      return;
    }
    if (current !== loggedInUser.password) {
      setPasswordError('Current password is incorrect.');
      setPasswordSuccess('');
      return;
    }
    if (next.length < 6) {
      setPasswordError('New password should be at least 6 characters.');
      setPasswordSuccess('');
      return;
    }
    if (next !== confirm) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordSuccess('');
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === loggedInUser.id ? { ...user, password: next } : user,
      ),
    );
    setPasswordError('');
    setPasswordSuccess('Password updated successfully.');
    event.target.reset();
  };

  const renderLogin = () => (
    <div className="auth-shell">
      <div className="auth-card login-layout">
        <div className="login-left">
          <div className="brand-row">
            <div className="brand-logo login-brand">
              <img src={`${process.env.PUBLIC_URL || ''}/images/logo.webp`} alt="Guftagu" />
            </div>
          </div>
          <h1 className="login-title">Steps to log in</h1>
          <ol className="steps">
            <li>Enter Komal Jangra or Pankaj Berwal as username.</li>
            <li>Enter the matching password to start chatting instantly.</li>
            <li>Enable notifications to get alerts on new messages.</li>
          </ol>
        </div>
        <div className="login-right">
          <div className="qr-card">
            <div className="qr-placeholder">Login</div>
            <div className="qr-body">
              <form className="login-form" onSubmit={handleLogin}>
                <label className="field">
                  <span>Username</span>
                  <input
                    name="username"
                    placeholder="Enter Komal Jangra or Pankaj Berwal"
                    autoComplete="username"
                    required
                  />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label className="field checkbox-field">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setNotificationsEnabled(next);
                      if (next && typeof Notification !== 'undefined') {
                        Notification.requestPermission().then((result) => {
                          setNotificationsEnabled(result === 'granted');
                        });
                      }
                    }}
                  />
                  <span>Enable notifications</span>
                </label>
                {loginError && <div className="error">{loginError}</div>}
                <button type="submit" className="primary-btn wide">
                  Log in
                </button>
              </form>
            </div>
          </div>
          <div className="copyright">
            Created with love ❤️ Pankaj Berwal
          </div>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="topbar" style={{ background: activeTheme.topbar }}>
      <div className="topbar-left">
        <button
          className="ghost-btn burger-btn"
          onClick={() => setIsSidebarOpen((v) => !v)}
          aria-label="Toggle contacts"
        >
          ☰
        </button>
        <div className="brand brand-logo">
          <img src={`${process.env.PUBLIC_URL || ''}/images/Yellow_Black_Brush_Streetwear_Brand_Logo__1_-removebg-preview (1).png`} alt="Guftagu" />
        </div>
      </div>
      <div className="actions">
        <button
          className="ghost-btn"
          onClick={() => setModeId((prev) => (prev === MODES.dark.id ? MODES.light.id : MODES.dark.id))}
        >
          {activeMode.id === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          className="ghost-btn"
          onClick={() => {
            const next = !notificationsEnabled;
            setNotificationsEnabled(next);
            if (next && typeof Notification !== 'undefined') {
              Notification.requestPermission().then((result) => {
                setNotificationsEnabled(result === 'granted');
              });
            }
          }}
        >
          Notifications: {notificationsEnabled ? 'On' : 'Off'}
        </button>
        <button className="ghost-btn" onClick={() => setShowDashboard(true)}>
          Dashboard
        </button>
        <button className="ghost-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      </header>
  );

  const renderSidebar = () => (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">Chats</div>
      {users.map((user) => {
        const isActive = user.id === activeChatUserId;
        const isSelf = user.id === loggedInUserId;
        return (
          <button
            key={user.id}
            className={`contact ${isActive ? 'active' : ''} ${
              isSelf ? 'self' : ''
            }`}
            disabled={isSelf}
            onClick={() => {
              setActiveChatUserId(user.id);
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <img src={user.avatar} alt={user.displayName} className="avatar" />
            <div className="contact-info">
              <div className="contact-name">{user.displayName}</div>
              <div className="contact-status">
                {isSelf ? 'You' : user.status}
                {!isSelf && isTyping && isActive ? ' • typing…' : ''}
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );

  const renderChat = () => (
    <section
      className="chat-area"
      style={{ backgroundImage: `url(${CHAT_WALLPAPER})` }}
    >
      <div className="chat-header">
        <div className="chat-peer">
          {activeChatUser && (
            <>
              <img
                src={activeChatUser.avatar}
                alt={activeChatUser.displayName}
                className="avatar"
              />
              <div>
                <div className="chat-name">{activeChatUser.displayName}</div>
                <div className="chat-status">
                  {isTyping ? 'Typing…' : activeChatUser.status}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="message-list">
        {conversation.length === 0 && (
          <div className="empty-state">Start a chat with emojis and status.</div>
        )}
        {conversation.map((msg) => {
          const fromSelf = msg.from === loggedInUserId;
          const msgReactions = reactions[msg.id] || {};
          const reactionDisplay = Object.values(msgReactions)
            .reduce((acc, emoji) => {
              acc[emoji] = (acc[emoji] || 0) + 1;
              return acc;
            }, {});
          return (
            <div
              key={msg.id}
              className={`message-row ${fromSelf ? 'from-self' : 'from-them'}`}
            >
              <div
                className="message-bubble"
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  e.preventDefault();
                  setShowEmojiPicker(false);
                  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
                  const choice = window.prompt(
                    'React with emoji (suggested: 👍 ❤️ 😂 😮 😢 🙏). Type one:',
                    quickEmojis.join(' ')
                  );
                  if (choice && choice.trim()) {
                    handleReact(msg.id, choice.trim().split(/\s+/)[0]);
                  }
                }}
              >
                <div className="message-text">{msg.text}</div>
                {Object.keys(reactionDisplay).length > 0 && (
                  <div className="reactions">
                    {Object.entries(reactionDisplay).map(([emoji, count]) => (
                      <span key={emoji} className="reaction-chip">
                        {emoji} {count > 1 ? count : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="composer">
        <button
          className={`emoji-btn ${showEmojiPicker ? 'active' : ''}`}
          onClick={() => setShowEmojiPicker((v) => !v)}
          type="button"
        >
          😊
        </button>
        {showEmojiPicker && (
          <div className="emoji-panel">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setDraftMessage((t) => t + emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <input
          className="message-input"
          placeholder="Type a message"
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="primary-btn send-btn" type="button" onClick={handleSend}>
          Send
        </button>
      </div>
    </section>
  );

  const renderDashboard = () => {
    if (!loggedInUser) return null;
    return (
      <div className="modal-backdrop" onClick={() => setShowDashboard(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-title">Personal Dashboard</div>
              <div className="modal-subtitle">
                Update display name and DP. Only you can see this screen.
              </div>
            </div>
            <button className="ghost-btn" onClick={() => setShowDashboard(false)}>
              Close
            </button>
          </div>
          <div className="profile">
            <img
              src={loggedInUser.avatar}
              alt={loggedInUser.displayName}
              className="profile-avatar"
            />
            <div className="profile-fields">
              <label className="field">
                <span>Display name</span>
                <input
                  value={loggedInUser.displayName}
                  onChange={(e) =>
                    updateProfile({ displayName: e.target.value.slice(0, 24) })
                  }
                />
              </label>
              <label className="field file-field">
                <span>Change DP</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </label>
              <div className="theme-section">
                <div className="modal-subtitle">Chat theme</div>
                <div className="theme-grid">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`theme-pill ${themeId === theme.id ? 'active' : ''}`}
                      onClick={() => setThemeId(theme.id)}
                      style={{
                        background: theme.topbar,
                      }}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divider" />
              <div className="modal-subtitle">Change password</div>
              <form className="login-form" onSubmit={handleChangePassword}>
                <label className="field">
                  <span>Current password</span>
                  <input name="currentPassword" type="password" required />
                </label>
                <label className="field">
                  <span>New password</span>
                  <input name="newPassword" type="password" required />
                </label>
                <label className="field">
                  <span>Confirm new password</span>
                  <input name="confirmPassword" type="password" required />
                </label>
                {passwordError && <div className="error">{passwordError}</div>}
                {passwordSuccess && <div className="success">{passwordSuccess}</div>}
                <button type="submit" className="primary-btn">
                  Update password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const effectiveMode = loggedInUser ? activeMode : MODES.light;

  const themeStyle = {
    '--topbar-bg': activeTheme.topbar,
    '--bubble-self-bg': activeTheme.bubbleSelf,
    '--bubble-them-bg': activeTheme.bubbleThem,
    '--composer-bg': activeTheme.composer,
    '--accent': activeTheme.accent,
    '--bg': effectiveMode.bg,
    '--text': effectiveMode.text,
    '--muted': effectiveMode.muted,
    '--card': effectiveMode.card,
    '--panel': effectiveMode.panel,
    '--border': effectiveMode.border,
    '--hover': effectiveMode.hover,
    '--input': effectiveMode.input,
    '--auth-bg': effectiveMode.authBg,
  };

  if (!loggedInUser) {
    const loginBackgroundStyle = {
      backgroundImage: `
        linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.82)),
        url(${process.env.PUBLIC_URL || ''}/images/Yellow_Black_Brush_Streetwear_Brand_Logo__1_-removebg-preview%20(1).png),
        url(${process.env.PUBLIC_URL || ''}/images/occan.webp)
      `,
      backgroundSize: 'cover, contain, cover',
      backgroundPosition: 'center, center, center',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
    };
    return (
      <div className="app-shell" style={themeStyle}>
        <div className="auth-screen" style={loginBackgroundStyle}>
          {renderLogin()}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" style={themeStyle}>
      {renderHeader()}
      <main className="layout">
        {isMobile && isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
        )}
        {renderSidebar()}
        {renderChat()}
      </main>
      {showDashboard && renderDashboard()}
    </div>
  );
}

export default App;
