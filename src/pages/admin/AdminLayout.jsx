import {
   NavLink,
   Outlet,
   useLocation,
   useNavigate,
} from "react-router-dom";

import "./AdminLayout.css";

function AdminLayout() {

   const navigate = useNavigate();
   const location = useLocation();

   const navItems = [
       {
           label: "Dashboard",
           icon: "⌂",
           path: "/admin/dashboard",
       },
       {
           label: "Students",
           icon: "🎓",
           path: "/admin/students",
       },
       {
           label: "Mentors",
           icon: "👨‍🏫",
           path: "/admin/mentors",
       },
       {
           label: "Departments",
           icon: "🏛️",
           path: "/admin/departments",
       },
       {
           label: "Events",
           icon: "📅",
           path: "/admin/events",
       },
       {
           label: "Announcements",
           icon: "📢",
           path: "/admin/announcements",
       },
       {
           label: "Resources",
           icon: "📚",
           path: "/admin/resources",
       },
       {
           label: "Complaints",
           icon: "⚠️",
           path: "/admin/complaints",
       },
       {
           label: "Community",
           icon: "💬",
           path: "/admin/community",
       },
   ];


   const getCurrentPage = () => {

       if (
           location.pathname.startsWith(
               "/admin/students/"
           )
       ) {
           return "Student Profile";
       }

       const item =
           navItems.find(
               (navItem) =>
                   location.pathname ===
                   navItem.path
           );

       return (
           item?.label ||
           "Admin"
       );
   };


   const handleLogout = () => {

       const confirmed =
           window.confirm(
               "Are you sure you want to logout?"
           );

       if (!confirmed) {
           return;
       }

       /*
        * Use the same logout logic/key cleanup
        * already used by your existing application.
        */

       localStorage.removeItem("token");
       localStorage.removeItem("accessToken");
       localStorage.removeItem("user");
       localStorage.removeItem("currentUser");
       localStorage.removeItem("authUser");
       localStorage.removeItem("userId");
       localStorage.removeItem("authUserId");

       navigate("/login", {
           replace: true,
       });
   };


   return (
       <div className="admin-layout">

           {/* SIDEBAR */}

           <aside className="admin-sidebar">

               <div className="admin-brand">

                   <div className="admin-brand-icon">
                       CC
                   </div>

                   <div>

                       <strong>
                           IET Connect
                       </strong>

                       <span>
                           Admin Portal
                       </span>

                   </div>

               </div>


               <nav className="admin-navigation">

                   <span className="nav-section-title">
                       MANAGEMENT
                   </span>

                   {navItems.map(
                       (item) => (

                           <NavLink
                               key={
                                   item.path
                               }
                               to={
                                   item.path
                               }
                               className={({
                                   isActive,
                               }) =>
                                   `admin-nav-item ${
                                       isActive
                                           ? "active"
                                           : ""
                                   }`
                               }
                           >

                               <span className="nav-icon">
                                   {
                                       item.icon
                                   }
                               </span>

                               <span>
                                   {
                                       item.label
                                   }
                               </span>

                           </NavLink>

                       )
                   )}

               </nav>


               <div className="admin-sidebar-bottom">

                   <div className="admin-user-card">

                       <div className="admin-user-avatar">
                           A
                       </div>

                       <div>

                           <strong>
                               Administrator
                           </strong>

                           <span>
                               Super Admin
                           </span>

                       </div>

                   </div>


                   <button
                       className="admin-logout"
                       onClick={
                           handleLogout
                       }
                   >

                       <span>
                           ⇥
                       </span>

                       Logout

                   </button>

               </div>

           </aside>


           {/* MAIN */}

           <main className="admin-main">

               {/* TOPBAR */}

               <header className="admin-topbar">

                   <div>

                       <span className="topbar-label">
                           IET CONNECT
                       </span>

                       <h2>
                           {getCurrentPage()}
                       </h2>

                   </div>


                   <div className="admin-topbar-right">

                       <div className="admin-role">
                           <span className="role-dot" />
                           ADMIN
                       </div>

                   </div>

               </header>


               {/* PAGE */}

               <div className="admin-page-content">

                   <Outlet />

               </div>

           </main>

       </div>
   );
}

export default AdminLayout;