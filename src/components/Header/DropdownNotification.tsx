import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ClickOutside from "../ClickOutside";
import api from "../../api";

interface Notification {
  _id: string;
  title: string;
  message: string;
  url: string;
  reader_count: number;
  createdAt: string;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement | null>(null); // for click outside detection

  // Polling interval in milliseconds
  const POLL_INTERVAL = 15000; // 15 seconds

  

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/metadata/notifications");
      const data = res.data.data;
      setNotifications(data);
      updateUnread(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Update unread count
  const updateUnread = (data: Notification[]) => {
    const unread = data.filter((n) => n.reader_count === 0).length;
    setUnreadCount(unread);
    setNotifying(unread > 0);
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
  try {
    // Ensure 'id' is a string
    if (typeof id !== "string") {
      console.error("Invalid notification id:", id);
      return;
    }

    await api.put("/api/metadata/notifications/view/add", {
      notification_ids: id,  // must be string
      user_id: 1,
    });

    const updated = notifications.map((n) =>
      n._id === id ? { ...n, reader_count: 1 } : n
    );
    setNotifications(updated);
    updateUnread(updated);
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }      
};


  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const ids = notifications.map((n) => n._id);
      await api.put("/api/metadata/notifications/view/add", {
        notification_ids: ids.join(","), // comma-separated string of IDs
        user_id: 1,
      });
      const updated = notifications.map((n) => ({ ...n, reader_count: 1 }));
      setNotifications(updated);
      updateUnread(updated);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Poll notifications on mount and every POLL_INTERVAL ms
  useEffect(() => {
    fetchNotifications(); // initial fetch
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => clearInterval(interval); // cleanup
  }, []);

  // Close dropdown when clicking outside (additional to ClickOutside wrapper)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SearchIcon = (
    <svg
      className="fill-body hover:fill-green-950 dark:fill-bodydark dark:hover:fill-green-950"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
      />
    </svg>
  );

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <div ref={dropdownRef} className="relative">
        <Link
          onClick={() => setDropdownOpen(!dropdownOpen)}
          to="#"
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-green-950 dark:hover:text-slate-100 dark:border-strokedark dark:bg-meta-4 dark:text-slate-300"
        >
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              unreadCount === 0 ? "hidden" : "inline"
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343Z"
              fill=""
            />
          </svg>
        </Link>

        {dropdownOpen && (
          <div className="absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
            <div className="px-4.5 py-3 flex justify-between items-center">
              <h5 className="text-sm font-medium text-bodydark2">Notification</h5>
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <ul className="flex h-auto flex-col overflow-y-auto">
              {notifications.map((n) => (
                <li key={n._id}>
                  <Link
                    onClick={() => markAsRead(n._id)}
                    className={`flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 ${
                      n.reader_count === 0 ? "bg-gray-100 dark:bg-blue-950" : ""
                    }`}
                    to={n.url}
                  >
                    <p className="text-sm">
                      <span className="text-black dark:text-white">
                        {n.title}
                      </span>{" "}
                      {n.message}
                    </p>
                    <p className="text-xs">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ClickOutside>
  );
};

export default DropdownNotification;
