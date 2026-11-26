import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectNotices, dismissNotice } from "../store/notices/noticesSlice";
import Notice from "./Notice";

// The messages from the store. Each one disappears by itself after 6 seconds.
function AutoNotice({ notice }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissNotice(notice.id)), 6000);
    return () => clearTimeout(timer);
  }, [notice.id, dispatch]);
  return <Notice notice={notice} onDismiss={() => dispatch(dismissNotice(notice.id))} />;
}

export default function NoticeList() {
  const notices = useSelector(selectNotices);
  if (notices.length === 0) return null;
  return (
    <div className="notices">
      {notices.map((notice) => (
        <AutoNotice key={notice.id} notice={notice} />
      ))}
    </div>
  );
}
