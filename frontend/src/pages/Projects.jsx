import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Projects() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await axios.post(
        "http://127.0.0.1:8000/projects/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");

    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.detail ||
        "Project creation failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-lg">

        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">
          Create Project
        </h1>

        <p className="text-gray-500 mb-8">
          Create a new project and start managing your tasks.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-5">

            <label className="block font-medium mb-2">
              Project Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>


          <div className="mb-6">

            <label className="block font-medium mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows="5"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Create Project
          </button>

        </form>

      </div>

    </div>
  );
}

export default Projects;