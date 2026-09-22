import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("access");

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH PROJECTS
  // =========================

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/projects/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/tasks/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // FETCH ACTIVITIES
  // =========================

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/activities/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActivities(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    const loadDashboard = async () => {
      await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchActivities(),
      ]);

      setLoading(false);
    };

    loadDashboard();
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");

    navigate("/login");
  };

  // =========================
  // STATISTICS
  // =========================

  const totalProjects = projects.length;

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status === "todo" ||
      task.status === "progress"
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "progress"
  ).length;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 sm:py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          <h1
            className="text-xl sm:text-2xl font-bold cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            TaskFlow
          </h1>

          <div className="flex items-center gap-2 sm:gap-4">

            <span className="text-gray-300 hidden sm:block">
              Hi, {username}
            </span>

            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
                className="relative bg-gray-800 hover:bg-gray-700 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl"
              >
                🔔

                {activities.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activities.length > 9 ? "9+" : activities.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-96 sm:w-96 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 z-50">

                  <div className="p-3 sm:p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">
                        Notifications
                      </h3>

                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-700 text-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      Recent updates from your projects
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto">

                    {activities.length === 0 ? (

                      <div className="p-8 text-center">
                        <div className="text-3xl mb-2">
                          🔔
                        </div>

                        <p className="text-gray-500">
                          No notifications yet
                        </p>
                      </div>

                    ) : (

                      activities.slice(0, 8).map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 sm:p-4 border-b hover:bg-gray-50 transition"
                        >
                          <div className="flex gap-3">

                            <div className="bg-blue-100 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                              🔔
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium break-words">
                                {activity.message}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  activity.created_at
                                ).toLocaleString()}
                              </p>
                            </div>

                          </div>
                        </div>
                      ))

                    )}

                  </div>

                  <div className="p-3 text-center border-t">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        document
                          .getElementById("recent-activity")
                          ?.scrollIntoView({
                            behavior: "smooth"
                          });
                      }}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-800"
                    >
                      View Recent Activity
                    </button>
                  </div>

                </div>
              )}

            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* =========================
            WELCOME
        ========================= */}

        <div className="mb-8">

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Welcome back, {username}! 👋
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your projects and tasks from one place.
          </p>

        </div>

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* TOTAL PROJECTS */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-gray-500 text-sm">
              Total Projects
            </p>

            <div className="flex justify-between items-end mt-3">

              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {totalProjects}
              </h3>

              <div className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg">
                📁
              </div>

            </div>

          </div>

          {/* TOTAL TASKS */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-gray-500 text-sm">
              Total Tasks
            </p>

            <div className="flex justify-between items-end mt-3">

              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {totalTasks}
              </h3>

              <div className="bg-purple-100 text-purple-600 px-3 py-2 rounded-lg">
                ✓
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-gray-500 text-sm">
              Completed Tasks
            </p>

            <div className="flex justify-between items-end mt-3">

              <h3 className="text-3xl sm:text-4xl font-bold text-green-600">
                {completedTasks}
              </h3>

              <div className="bg-green-100 text-green-600 px-3 py-2 rounded-lg">
                ✓
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-gray-500 text-sm">
              Pending Tasks
            </p>

            <div className="flex justify-between items-end mt-3">

              <h3 className="text-3xl sm:text-4xl font-bold text-orange-500">
                {pendingTasks}
              </h3>

              <div className="bg-orange-100 text-orange-600 px-3 py-2 rounded-lg">
                ⏳
              </div>

            </div>

          </div>

        </div>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

            <div>

              <h3 className="text-lg sm:text-xl font-bold">
                Quick Actions
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Create and manage your projects.
              </p>

            </div>

            <button
              onClick={() => navigate("/projects")}
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              + Create Project
            </button>

          </div>

        </div>

        {/* =========================
            TASK PROGRESS
        ========================= */}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">

            <div>

              <h3 className="text-lg sm:text-xl font-bold">
                Task Progress
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Current task status overview
              </p>

            </div>

            <span className="text-sm text-blue-600 font-semibold">
              {progressTasks} in progress
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* TODO */}

            <div className="bg-gray-100 rounded-xl p-5">

              <p className="text-gray-500 text-sm">
                To Do
              </p>

              <h4 className="text-2xl sm:text-3xl font-bold mt-2">
                {
                  tasks.filter(
                    (task) =>
                      task.status === "todo"
                  ).length
                }
              </h4>

            </div>

            {/* PROGRESS */}

            <div className="bg-blue-50 rounded-xl p-5">

              <p className="text-blue-600 text-sm">
                In Progress
              </p>

              <h4 className="text-2xl sm:text-3xl font-bold mt-2 text-blue-700">
                {progressTasks}
              </h4>

            </div>

            {/* DONE */}

            <div className="bg-green-50 rounded-xl p-5">

              <p className="text-green-600 text-sm">
                Completed
              </p>

              <h4 className="text-2xl sm:text-3xl font-bold mt-2 text-green-700">
                {completedTasks}
              </h4>

            </div>

          </div>

        </div>

        {/* =========================
            RECENT ACTIVITY
        ========================= */}

        <div id="recent-activity" className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">

            <div>
              <h3 className="text-lg sm:text-xl font-bold">
                Recent Activity
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Latest updates from your projects.
              </p>
            </div>

            <span className="text-sm text-gray-400">
              Latest 8 activities
            </span>

          </div>

          {activities.length === 0 ? (

            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">🔔</div>

              <p className="text-gray-600 font-medium">
                No recent activity
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Project and task updates will appear here.
              </p>
            </div>

          ) : (

            <div className="space-y-4">

              {activities.slice(0, 8).map((activity) => (

                <div
                  key={activity.id}
                  className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >

                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    🔔
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-gray-800 font-medium break-words">
                      {activity.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">

                      <span className="text-sm text-gray-500">
                        by {activity.user?.username || "User"}
                      </span>

                      <span className="text-gray-300">
                        •
                      </span>

                      <span className="text-sm text-gray-400">
                        {new Date(
                          activity.created_at
                        ).toLocaleString()}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* =========================
            PROJECTS
        ========================= */}

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">

          <div>

            <h3 className="text-xl sm:text-2xl font-bold">
              Your Projects
            </h3>

            <p className="text-gray-500 mt-1">
              Projects you are currently working on.
            </p>

          </div>

          <button
            onClick={() => navigate("/projects")}
            className="text-blue-600 font-semibold hover:text-blue-800"
          >
            + New Project
          </button>

        </div>

        {projects.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

            <h3 className="text-xl font-semibold">
              No projects yet
            </h3>

            <p className="text-gray-500 mt-2">
              Create your first project to get started.
            </p>

            <button
              onClick={() => navigate("/projects")}
              className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Project
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {projects.map((project) => {

              const projectTasks = tasks.filter(
                (task) =>
                  task.project === project.id
              );

              const projectCompleted = projectTasks.filter(
                (task) =>
                  task.status === "done"
              ).length;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100"
                >

                  <div className="flex justify-between items-start gap-2 sm:gap-3">

                    <h3 className="text-lg sm:text-xl font-bold">
                      {project.name}
                    </h3>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                      {projectTasks.length} tasks
                    </span>

                  </div>

                  <p className="text-gray-600 mt-3 min-h-[48px] break-words">
                    {project.description ||
                      "No description"}
                  </p>

                  <div className="border-t mt-5 pt-4">

                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Completed
                      </span>

                      <span className="font-semibold">
                        {projectCompleted}/
                        {projectTasks.length}
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width:
                            projectTasks.length > 0
                              ? `${
                                  (projectCompleted /
                                    projectTasks.length) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/projects/${project.id}`
                      )
                    }
                    className="mt-5 w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 active:scale-[0.99] transition"
                  >
                    View Project →
                  </button>

                </div>
              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default Dashboard;