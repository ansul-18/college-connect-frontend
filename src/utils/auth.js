export const getToken = () => {
   return localStorage.getItem("token");
 };
 
 export const getStoredUser = () => {
   const user = localStorage.getItem("user");
 
   if (!user) {
     return null;
   }
 
   try {
     return JSON.parse(user);
   } catch (error) {
     console.error("Invalid stored user:", error);
     return null;
   }
 };
 
 export const normalizeRole = (role) => {
   if (!role) return null;
 
   const normalized = role.toString().toUpperCase();
 
   switch (normalized) {
     case "USER":
     case "STUDENT":
     case "ROLE_USER":
     case "ROLE_STUDENT":
       return "STUDENT";
 
     case "MENTOR":
     case "ROLE_MENTOR":
       return "MENTOR";
 
     case "ADMIN":
     case "SUPER_ADMIN":
     case "ROLE_ADMIN":
     case "ROLE_SUPER_ADMIN":
       return "ADMIN";
 
     default:
       return normalized.replace("ROLE_", "");
   }
 };
 
 export const saveAuth = (authResponse) => {
   const user = {
     userId: authResponse.userId,
     name: authResponse.name,
     email: authResponse.email,
     role: normalizeRole(authResponse.role),
   };
 
   localStorage.setItem("token", authResponse.token);
   localStorage.setItem("user", JSON.stringify(user));
 
   return user;
 };
 
 export const clearAuth = () => {
   localStorage.removeItem("token");
   localStorage.removeItem("user");
 };
 
 export const isLoggedIn = () => {
   return Boolean(getToken());
 };