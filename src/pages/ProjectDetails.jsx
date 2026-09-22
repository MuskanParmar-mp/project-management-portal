import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [selectedMember, setSelectedMember] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    assigned_to_id: "",
  });

  // =========================
  // FETCH PROJECT
  // =========================

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/projects/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProject(response.data);
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

      const projectTasks = response.data.filter(
        (task) => task.project === Number(id)
      );

      setTasks(projectTasks);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchUsers();
  }, [id]);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      assigned_to_id: "",
    });

    setEditingTaskId(null);
    setShowForm(false);
  };

  // =========================
  // CREATE / UPDATE TASK
  // =========================

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        project: Number(id),
        assigned_to_id: formData.assigned_to_id
          ? Number(formData.assigned_to_id)
          : null,
      };

      if (editingTaskId) {
        await axios.patch(
          `http://127.0.0.1:8000/tasks/${editingTaskId}/`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Task updated successfully");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/tasks/",
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Task created successfully");
      }

      resetForm();
      fetchTasks();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.assigned_to_id?.[0] ||
          error.response?.data?.detail ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // EDIT TASK
  // =========================

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
      assigned_to_id: task.assigned_to
        ? String(task.assigned_to.id)
        : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE TASK
  // =========================

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/tasks/${taskId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();

      alert("Task deleted successfully");
    } catch (error) {
      console.log(error);

      alert("Unable to delete task");
    }
  };

  // =========================
  // ADD MEMBER
  // =========================

  const handleAddMember = async () => {
    if (!selectedMember) {
      alert("Please select a user");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/projects/${id}/add-member/`,
        {
          user_id: Number(selectedMember),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedMember("");
      setShowMemberForm(false);

      fetchProject();

      alert("Member added successfully");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Unable to add member"
      );
    }
  };

  // =========================
  // UPDATE TASK STATUS
  // =========================

  const updateTaskStatus = async (
    taskId,
    newStatus
  ) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/tasks/${taskId}/`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // FILTER TASKS
  // =========================

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  );

  const progressTasks = tasks.filter(
    (task) => task.status === "progress"
  );

  const doneTasks = tasks.filter(
    (task) => task.status === "done"
  );

  // =========================
  // TASK CARD
  // =========================

  const TaskCard = ({ task }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">

      {/* TITLE + PRIORITY */}

      <div className="flex justify-between items-start gap-3">

        <h3 className="font-bold text-lg">
          {task.title}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            task.priority === "high"
              ? "bg-red-100 text-red-600"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {task.priority}
        </span>

      </div>

      {/* DESCRIPTION */}

      <p className="text-gray-600 text-sm mt-3">
        {task.description || "No description"}
      </p>

      {/* ASSIGNED */}

      <p className="text-gray-600 text-sm mt-3">
        <span className="font-semibold">
          Assigned:
        </span>{" "}
        {task.assigned_to?.username || "Not assigned"}
      </p>

      {/* DUE DATE */}

      {task.due_date && (
        <p className="text-gray-500 text-sm mt-2">
          <span className="font-semibold">
            Due:
          </span>{" "}
          {task.due_date}
        </p>
      )}

      {/* VIEW DETAILS */}

      <button
        onClick={() =>
          navigate(`/tasks/${task.id}`)
        }
        className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        View Details →
      </button>

      {/* EDIT + DELETE */}

      <div className="grid grid-cols-2 gap-2 mt-3">

        <button
          onClick={() => handleEditTask(task)}
          className="bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200"
        >
          Edit Task
        </button>

        <button
          onClick={() =>
            handleDeleteTask(task.id)
          }
          className="bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-200"
        >
          Delete
        </button>

      </div>

      {/* STATUS BUTTONS */}

      <div className="mt-4 flex gap-2 flex-wrap">

        {task.status !== "todo" && (
          <button
            onClick={() =>
              updateTaskStatus(
                task.id,
                "todo"
              )
            }
            className="text-xs bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            To Do
          </button>
        )}

        {task.status !== "progress" && (
          <button
            onClick={() =>
              updateTaskStatus(
                task.id,
                "progress"
              )
            }
            className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200"
          >
            In Progress
          </button>
        )}

        {task.status !== "done" && (
          <button
            onClick={() =>
              updateTaskStatus(
                task.id,
                "done"
              )
            }
            className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200"
          >
            Done
          </button>
        )}

      </div>

    </div>
  );

  // =========================
  // LOADING
  // =========================

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}

      <nav className="bg-gray-900 text-white px-6 py-4">

        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <h1
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-2xl font-bold cursor-pointer"
          >
            TaskFlow
          </h1>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-gray-300 hover:text-white"
          >
            Dashboard
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* PROJECT HEADER */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">

            <div>

              <h2 className="text-3xl font-bold">
                {project.name}
              </h2>

              <p className="text-gray-600 mt-2">
                {project.description ||
                  "No description"}
              </p>

            </div>

            <div className="flex gap-3 flex-wrap">

              <button
                onClick={() =>
                  setShowMemberForm(
                    !showMemberForm
                  )
                }
                className="bg-gray-800 text-white px-5 py-3 rounded-lg hover:bg-gray-900"
              >
                + Add Member
              </button>

              <button
                onClick={() => {
                  setEditingTaskId(null);

                  setFormData({
                    title: "",
                    description: "",
                    status: "todo",
                    priority: "medium",
                    due_date: "",
                    assigned_to_id: "",
                  });

                  setShowForm(!showForm);
                }}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
              >
                + Add Task
              </button>

            </div>

          </div>

        </div>

        {/* PROJECT MEMBERS */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-xl font-bold">
              Project Members
            </h3>

            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {project.members?.length || 0}
            </span>

          </div>

          <div className="flex flex-wrap gap-3">

            {project.members?.map(
              (member) => (
                <div
                  key={member.id}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <span className="font-medium">
                    {member.username}
                  </span>
                </div>
              )
            )}

          </div>

        </div>

        {/* ADD MEMBER */}

        {showMemberForm && (

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

            <h3 className="text-xl font-bold mb-5">
              Add Team Member
            </h3>

            <div className="flex flex-col md:flex-row gap-3">

              <select
                value={selectedMember}
                onChange={(e) =>
                  setSelectedMember(
                    e.target.value
                  )
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
              >

                <option value="">
                  Select a user
                </option>

                {users
                  .filter(
                    (user) =>
                      !project.members?.some(
                        (member) =>
                          member.id === user.id
                      )
                  )
                  .map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.username}
                    </option>
                  ))}

              </select>

              <button
                onClick={handleAddMember}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Add Member
              </button>

            </div>

          </div>

        )}

        {/* CREATE / EDIT TASK FORM */}

        {showForm && (

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

            <div className="flex justify-between items-center mb-5">

              <h3 className="text-xl font-bold">
                {editingTaskId
                  ? "Edit Task"
                  : "Create New Task"}
              </h3>

              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

            </div>

            <form onSubmit={handleTaskSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* TITLE */}

                <div>

                  <label className="block font-medium mb-2">
                    Task Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                  />

                </div>

                {/* PRIORITY */}

                <div>

                  <label className="block font-medium mb-2">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                  </select>

                </div>

                {/* ASSIGN */}

                <div>

                  <label className="block font-medium mb-2">
                    Assign To
                  </label>

                  <select
                    name="assigned_to_id"
                    value={
                      formData.assigned_to_id
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >

                    <option value="">
                      Not Assigned
                    </option>

                    {project.members?.map(
                      (member) => (
                        <option
                          key={member.id}
                          value={member.id}
                        >
                          {member.username}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* STATUS */}

                <div>

                  <label className="block font-medium mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >

                    <option value="todo">
                      To Do
                    </option>

                    <option value="progress">
                      In Progress
                    </option>

                    <option value="done">
                      Done
                    </option>

                  </select>

                </div>

                {/* DUE DATE */}

                <div>

                  <label className="block font-medium mb-2">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="block font-medium mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Describe the task"
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 mt-6">

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                >
                  {editingTaskId
                    ? "Save Changes"
                    : "Create Task"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 px-5 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

        {/* TASK BOARD */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* TODO */}

          <div className="bg-gray-200 rounded-2xl p-4">

            <div className="flex justify-between mb-5">

              <h3 className="font-bold text-lg">
                To Do
              </h3>

              <span className="bg-white px-3 py-1 rounded-full text-sm">
                {todoTasks.length}
              </span>

            </div>

            <div className="space-y-4">

              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                />
              ))}

            </div>

          </div>

          {/* IN PROGRESS */}

          <div className="bg-blue-50 rounded-2xl p-4">

            <div className="flex justify-between mb-5">

              <h3 className="font-bold text-lg">
                In Progress
              </h3>

              <span className="bg-white px-3 py-1 rounded-full text-sm">
                {progressTasks.length}
              </span>

            </div>

            <div className="space-y-4">

              {progressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                />
              ))}

            </div>

          </div>

          {/* DONE */}

          <div className="bg-green-50 rounded-2xl p-4">

            <div className="flex justify-between mb-5">

              <h3 className="font-bold text-lg">
                Done
              </h3>

              <span className="bg-white px-3 py-1 rounded-full text-sm">
                {doneTasks.length}
              </span>

            </div>

            <div className="space-y-4">

              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                />
              ))}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ProjectDetails;