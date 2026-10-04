const ConversationItem = ({
   conversation,
   active,
   onClick,
 }) => {
   return (
     <button
       className={
         active
           ? "conversation-item active"
           : "conversation-item"
       }
       onClick={onClick}
     >
 
       <div className="conversation-avatar">
         {conversation.otherUserName
           ?.charAt(0)
           ?.toUpperCase() || "U"}
       </div>
 
       <div className="conversation-content">
 
         <strong>
           {conversation.otherUserName ||
             "User"}
         </strong>
 
         <p>
           {conversation.lastMessage ||
             "No messages yet"}
         </p>
 
       </div>
 
       <div className="conversation-meta">
 
         {conversation.unreadCount > 0 && (
           <span className="unread-count">
             {conversation.unreadCount}
           </span>
         )}
 
       </div>
 
     </button>
   );
 };
 
 export default ConversationItem;