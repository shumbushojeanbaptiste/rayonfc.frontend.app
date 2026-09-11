import { useState, useEffect, useRef, useCallback } from "react";
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchingRef = useRef(false);

  // ------------------------------------------------
  // UPDATE UNREAD COUNT
  // ------------------------------------------------
  const updateUnread = useCallback((data: Notification[]) => {
    const unread = data.filter(
      (notification) => notification.reader_count === 0
    ).length;

    setUnreadCount(unread);
  }, []);

  // ------------------------------------------------
  // FETCH NOTIFICATIONS
  // ------------------------------------------------
  const fetchNotifications = useCallback(async () => {
    // Prevent duplicate requests
    if (fetchingRef.current) {
      return;
    }

    // Don't fetch when browser tab is hidden
    if (document.visibilityState === "hidden") {
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await api.get("/api/metadata/notifications");

      const data: Notification[] = res.data?.data || [];

      setNotifications(data);
      updateUnread(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [updateUnread]);

  // ------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ------------------------------------------------
  // REFRESH WHEN TAB BECOMES ACTIVE
  // ------------------------------------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchNotifications]);

  // ------------------------------------------------
  // MARK ONE NOTIFICATION AS READ
  // ------------------------------------------------
  const markAsRead = async (id: string) => {
    if (typeof id !== "string" || !id) {
      console.error("Invalid notification id:", id);
      return;
    }

    try {
      await api.put(
        "/api/metadata/notifications/view/add",
        {
          notification_ids: id,
          user_id: 1,
        }
      );

      setNotifications((currentNotifications) => {
        const updated = currentNotifications.map(
          (notification) =>
            notification._id === id
              ? {
                  ...notification,
                  reader_count: 1,
                }
              : notification
        );

        updateUnread(updated);

        return updated;
      });
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  // ------------------------------------------------
  // MARK ALL AS READ
  // ------------------------------------------------
  const markAllAsRead = async () => {
    if (notifications.length === 0) {
      return;
    }

    try {
      const ids = notifications.map(
        (notification) => notification._id
      );

      await api.put(
        "/api/metadata/notifications/view/add",
        {
          notification_ids: ids.join(","),
          user_id: 1,
        }
      );

      setNotifications((currentNotifications) => {
        const updated = currentNotifications.map(
          (notification) => ({
            ...notification,
            reader_count: 1,
          })
        );

        updateUnread(updated);

        return updated;
      });
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );
    }
  };

  // ------------------------------------------------
  // OPEN / CLOSE DROPDOWN
  // ------------------------------------------------
  const handleNotificationClick = () => {
    const nextState = !dropdownOpen;

    setDropdownOpen(nextState);

    // Fetch fresh data only when opening the dropdown
    if (nextState) {
      fetchNotifications();
    }
  };

  return (
    <ClickOutside
      onClick={() => setDropdownOpen(false)}
      className="relative"
    >
      <div className="relative">

        {/* NOTIFICATION BUTTON */}
        <Link
          to="#"
          onClick={(event) => {
            event.preventDefault();
            handleNotificationClick();
          }}
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-green-950 dark:hover:text-slate-100 dark:border-strokedark dark:bg-meta-4 dark:text-slate-300"
        >
          {/* UNREAD INDICATOR */}
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              unreadCount === 0 ? "hidden" : "inline"
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          {/* NOTIFICATION ICON */}
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

        {/* DROPDOWN */}
        {dropdownOpen && (
          <div className="absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">
                Notification
              </h5>

              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-blue-500 hover:underline disabled:opacity-50"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* LOADING */}
            {loading && notifications.length === 0 && (
              <div className="px-4.5 py-4 text-sm text-gray-500">
                Loading notifications...
              </div>
            )}

            {/* NOTIFICATION LIST */}
            <ul className="flex h-auto flex-col overflow-y-auto">

              {notifications.length === 0 && !loading ? (
                <li className="px-4.5 py-6 text-center text-sm text-gray-500">
                  No notifications
                </li>
              ) : (
                notifications.map((notification) => (
                  <li key={notification._id}>
                    <Link
                      to={notification.url}
                      onClick={() =>
                        markAsRead(notification._id)
                      }
                      className={`flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 ${
                        notification.reader_count === 0
                          ? "bg-gray-100 dark:bg-blue-950"
                          : ""
                      }`}
                    >
                      <p className="text-sm">
                        <span className="text-black dark:text-white">
                          {notification.title}
                        </span>{" "}
                        {notification.message}
                      </p>

                      <p className="text-xs">
                        {new Date(
                          notification.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))
              )}

            </ul>
          </div>
        )}
      </div>
    </ClickOutside>
  );
};

export default DropdownNotification;