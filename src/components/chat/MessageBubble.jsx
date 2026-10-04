const MessageBubble = ({
   message,
   own,
 }) => {
   return (
     <div
       className={
         own
           ? "message-row own"
           : "message-row"
       }
     >
       <div className="message-bubble">
 
         <p>
           {message.content}
         </p>
 
         <span>
           {message.createdAt
             ? new Date(
                 message.createdAt
               ).toLocaleTimeString([], {
                 hour: "2-digit",
                 minute: "2-digit",
               })
             : ""}
         </span>
 
       </div>
     </div>
   );
 };
 
 export default MessageBubble;