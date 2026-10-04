import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Mentors from "./pages/Mentors";
import MentorDetails from "./pages/MentorDetails";
import Community from "./pages/Community";
import CommunityPostDetails from "./pages/CommunityPostDetails";
import Resources from "./pages/Resources";
import Announcements from "./pages/Announcements";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student pages
import StudentEvents from "./pages/student/StudentEvents";
import Complaints from "./pages/student/Complaints";
import Profile from "./pages/student/Profile";
import StudentChats from "./pages/student/StudentChats";
import ChatConversation from "./pages/student/ChatConversation";
import StudentChatConversation from "./pages/student/StudentChatConversation";

// Public complaint page
import PublicComplaints from "./pages/Complaints";

// Mentor pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorProfile from "./pages/mentor/MentorProfile";
import MentorChats from "./pages/mentor/Mentorchats";
import MentorChatConversation from "./pages/mentor/MentorChatConversation";
// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetails from "./pages/admin/AdminStudentDetails";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminResources from "./pages/admin/AdminResources";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminCommunity from "./pages/admin/AdminCommunity";

import CommunityUserProfile
  from "./pages/CommunityUserProfile";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>

          {/* =====================================================
              PUBLIC ROUTES
          ===================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/departments"
            element={<Departments />}
          />

<Route path="/events" element={<StudentEvents />} />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          <Route
            path="/mentors"
            element={<Mentors />}
          />

          <Route
            path="/mentors/:id"
            element={<MentorDetails />}
          />

          <Route
            path="/community"
            element={<Community />}
          />

          <Route
            path="/community/post/:id"
            element={<CommunityPostDetails />}
          />
          <Route
  path="/community/user/:authUserId"
  element={
    <CommunityUserProfile />
  }
/>

          <Route
            path="/resources"
            element={<Resources />}
          />

          <Route
            path="/announcements"
            element={<Announcements />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />



          {/* =====================================================
    STUDENT ROUTES
===================================================== */}

<Route
    element={
        <ProtectedRoute allowedRoles={["STUDENT"]} />
    }
>

    {/* My Profile */}

    <Route
        path="/student/profile"
        element={<Profile />}
    />


    

    <Route
        path="/student/events"
        element={<StudentEvents />}
    />

    <Route
        path="/student/mentors"
        element={<Mentors />}
    />

    <Route
        path="/student/community"
        element={<Community />}
    />

    <Route
        path="/student/chats"
        element={<StudentChats />}
    />

    <Route
        path="/student/chats/:conversationId"
        element={<StudentChatConversation />}
    />

    <Route
        path="/student/resources"
        element={<Resources />}
    />

    <Route
        path="/student/complaints"
        element={<Complaints />}
            />

            <Route
    path="/complaints"
    element={<PublicComplaints />}
/>

    <Route
        path="/student/announcements"
        element={<Announcements />}
    />

</Route>
          {/* =====================================================
              MENTOR ROUTES
          ===================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["MENTOR"]} />
            }
          >

            <Route
              path="/mentor/dashboard"
              element={<MentorDashboard />}
            />

            <Route
              path="/mentor/profile"
              element={<MentorProfile />}
            />

<Route
    path="/mentor/chats"
    element={
        
            <MentorChats />
        
    }
            />

<Route
    path="/mentor/chats/:conversationId"
    element={
       
            <MentorChatConversation />
      
    }
/>

           
          </Route>


          {/* =====================================================
              ADMIN ROUTES
          ===================================================== */}

<Route
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]} />
    }
>
    <Route
        path="/admin"
        element={<AdminLayout />}
    >
        <Route
            path="dashboard"
            element={<AdminDashboard />}
        />

        <Route
            path="students"
            element={<AdminStudents />}
        />

        <Route
            path="students/:id"
            element={<AdminStudentDetails />}
        />

        <Route
            path="mentors"
            element={<AdminMentors />}
        />

        <Route
            path="departments"
            element={<AdminDepartments />}
        />

        <Route
            path="events"
            element={<AdminEvents />}
        />

        <Route
            path="announcements"
            element={<AdminAnnouncements />}
        />

        <Route
            path="resources"
            element={<AdminResources />}
        />

        <Route
            path="complaints"
            element={<AdminComplaints />}
        />

        <Route
            path="community"
            element={<AdminCommunity />}
        />
    </Route>
</Route>

        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;