import {
   Client
} from "@stomp/stompjs";

import {
   useCallback,
   useEffect,
   useRef,
   useState
} from "react";


const WS_BASE_URL =
   "ws://localhost:8080";


const useChatSocket = ({
   conversationId,
   onMessage
}) => {

   const clientRef =
       useRef(null);


   const [connected, setConnected] =
       useState(false);


   const [error, setError] =
       useState(null);


   const getToken = () => {

       return localStorage.getItem(
           "token"
       );
   };


    useEffect(() => {
       
        console.log("========== useChatSocket START ==========");
    console.log("conversationId =", conversationId);


       if (!conversationId) {
           return;
       }


       const token =
           getToken();

       if (!token) {

           setError(
               "Authentication token not found"
           );

           return;
       }


       const client =
           new Client({

               brokerURL:
                   `${WS_BASE_URL}/ws`,

               connectHeaders: {

                   Authorization:
                       `Bearer ${token}`
               },

               reconnectDelay: 5000,

               debug: (message) => {

                   console.log(
                       "[STOMP]",
                       message
                   );
               }
           });


       client.onConnect = () => {

           console.log(
               "WebSocket connected"
           );

           setConnected(true);
           setError(null);


           client.subscribe(

               `/topic/conversation/${conversationId}`,

               (message) => {

                   try {

                       const data =
                           JSON.parse(
                               message.body
                           );

                       onMessage?.(
                           data
                       );

                   } catch (err) {

                       console.error(
                           "Invalid socket message:",
                           err
                       );
                   }
               }
           );
       };


       client.onStompError =
           (frame) => {

               console.error(
                   "STOMP error:",
                   frame
               );

               setError(
                   frame?.headers?.message ||
                   "Chat server error"
               );
           };


       client.onWebSocketError =
           (event) => {

               console.error(
                   "WebSocket error:",
                   event
               );

               setError(
                   "WebSocket connection failed"
               );
           };


       client.onDisconnect = () => {

           console.log(
               "WebSocket disconnected"
           );

           setConnected(false);
       };


       clientRef.current =
           client;

           console.log("Activating WebSocket...");
           
       client.activate();


       return () => {

           setConnected(false);

           if (
               clientRef.current
           ) {

               clientRef.current.deactivate();

               clientRef.current =
                   null;
           }
       };

   }, [conversationId, onMessage]);


   const sendMessage =
       useCallback(
           (content) => {

               const client =
                   clientRef.current;

               if (
                   !client ||
                   !client.connected
               ) {

                   throw new Error(
                       "Chat is not connected"
                   );
               }


               const cleanContent =
                   content.trim();


               if (!cleanContent) {
                   return;
               }


               client.publish({

                   destination:
                       "/app/chat.send",

                   body:
                       JSON.stringify({

                           conversationId:
                               Number(
                                   conversationId
                               ),

                           content:
                               cleanContent
                       })
               });

           },
           [conversationId]
       );


   return {

       connected,

       error,

       sendMessage
   };
};


export default useChatSocket;