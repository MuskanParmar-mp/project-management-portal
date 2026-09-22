import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username");

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const fetchTask = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/tasks/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTask(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/comments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const taskComments = response.data.filter(
        (comment) => comment.task === Number(id)
      );

      setComments(taskComments);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/comments/",
        {
          task: Number(id),
          text: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCommentText("");

      fetchComments();

    } catch (error) {
      console.log(error);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}

      <nav className="bg-gray-900 text-white px-6 py-4">

        <div className="max-w-5xl mx-auto flex justify-between items-center">

          <h1
            onClick={() =>
              navigate(`/projects/${task.project}`)
            }
            className="text-2xl font-bold cursor-pointer"
          >
            TaskFlow
          </h1>

          <button
            onClick={() =>
              navigate(`/projects/${task.project}`)
            }
            className="text-gray-300 hover:text-white"
          >
            ← Back to Project
          </button>

        </div>

      </nav>


      {/* Main */}

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Task Information */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          <div className="flex flex-col md:flex-row md:justify-between gap-5">

            <div>

              <h2 className="text-3xl font-bold">
                {task.title}
              </h2>

              <p className="text-gray-600 mt-3">
                {task.description || "No description"}
              </p>

            </div>


            <div className="flex gap-3">

              <span
                className={`h-fit px-3 py-2 rounded-full text-sm ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-600"
                    : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {task.priority}
              </span>

              <span className="h-fit bg-blue-100 text-blue-600 px-3 py-2 rounded-full text-sm">
                {task.status}
              </span>

            </div>

          </div>


          {/* Task Meta */}

          <div className="border-t mt-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <p className="text-gray-500 text-sm">
                Assigned To
              </p>

              <p className="font-semibold mt-1">
                {task.assigned_to?.username || "Not assigned"}
              </p>

            </div>


            <div>

              <p className="text-gray-500 text-sm">
                Due Date
              </p>

              <p className="font-semibold mt-1">
                {task.due_date || "No due date"}
              </p>

            </div>

          </div>

        </div>


        {/* Comments */}

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h3 className="text-2xl font-bold mb-6">
            Comments ({comments.length})
          </h3>


          {/* Existing Comments */}

          <div className="space-y-4 mb-8">

            {comments.length === 0 ? (

              <p className="text-gray-500">
                No comments yet. Start the conversation.
              </p>

            ) : (

              comments.map((comment) => (

                <div
                  key={comment.id}
                  className="bg-gray-50 p-4 rounded-xl"
                >

                  <div className="flex justify-between items-center">

                    <p className="font-semibold">
                      {comment.user?.username}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(
                        comment.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  <p className="text-gray-700 mt-2">
                    {comment.text}
                  </p>

                </div>

              ))

            )}

          </div>


          {/* Add Comment */}

          <form onSubmit={handleComment}>

            <textarea
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
              placeholder={`Comment as ${username}...`}
              rows="4"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="mt-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Add Comment
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default TaskDetails;