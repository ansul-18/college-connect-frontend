import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./resources.css";
import { getAllResources } from "../api/collegeApi";

const categories = [
  "ALL",
  "NOTES",
  "PYQ",
  "LAB_MANUAL",
  "PLACEMENT",
];

const departments = [
  "ALL",
  "CSE",
  "IT",
  "ECE",
  "EE",
  "ME",
  "CE",
];

const years = [
  "ALL",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

const getResourceType = (resource) => {
  const type = String(resource?.fileType || "FILE").trim().toUpperCase();

  if (type.includes("PDF")) return "PDF";
  if (type.includes("DOC")) return "DOC";
  if (type.includes("PPT")) return "PPT";
  if (type.includes("XLS") || type.includes("SHEET")) return "XLS";
  return type.slice(0, 6) || "FILE";
};

function Resources() {
  const [resources, setResources] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [year, setYear] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllResources();

        setResources(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to load resources:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load resources."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchMatch =
        !query ||
        resource.title
          ?.toLowerCase()
          .includes(query) ||
        resource.description
          ?.toLowerCase()
          .includes(query) ||
        resource.department
          ?.toLowerCase()
          .includes(query);

      const categoryMatch =
        category === "ALL" ||
        resource.category === category;

      const departmentMatch =
        department === "ALL" ||
        resource.department === department ||
        resource.department === "ALL BRANCHES";

      const yearMatch =
        year === "ALL" ||
        resource.year === year ||
        resource.year === "All Years";

      return (
        searchMatch &&
        categoryMatch &&
        departmentMatch &&
        yearMatch
      );
    });
  }, [
    resources,
    search,
    category,
    department,
    year,
  ]);

  const formatCategory = (value) => {
    if (value === "ALL") {
      return "All";
    }

    return value
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("ALL");
    setDepartment("ALL");
    setYear("ALL");
  };

  const handleDownload = (resource) => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, "_blank");
      return;
    }

    alert(
      `File URL is not available for "${resource.title}".`
    );
  };

  if (loading) {
    return (
      <div className="page-loader">
        Loading resources...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        {error}
      </div>
    );
  }

  return (
    <div className="resources-page">

      {/* ================= HEADER ================= */}

      <section className="resources-header">
        <div className="container">

          <div className="resources-breadcrumb">

            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <span>
              Resources
            </span>

          </div>

          <div className="resources-header-content">

            <div>

              <span className="dashboard-eyebrow">
                COLLEGE RESOURCES
              </span>

              <h1>
                Notes, papers and
                <span>
                  {" "}
                  study material.
                </span>
              </h1>

              <p>
                Notes, previous year papers, lab manuals
                and placement material for students.
              </p>

            </div>

            <div className="resources-stat">

              <strong>
                {resources.length}+
              </strong>

              <span>
                resources available
              </span>

            </div>

          </div>

        </div>
      </section>

      {/* ================= CONTENT ================= */}

      <main className="container resources-content">

        {/* FILTER CARD */}

        <section className="resources-filter-card">

          {/* SEARCH */}

          <div className="resources-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search notes, PYQs, lab manuals..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="resources-search-clear"
              >
                ×
              </button>
            )}

          </div>

          {/* CATEGORY */}

          <div className="resource-filter-group">

            <span className="resource-filter-label">
              Category
            </span>

            <div className="resource-filter-pills">

              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? "resource-filter active"
                      : "resource-filter"
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {formatCategory(item)}
                </button>
              ))}

            </div>

          </div>

          {/* DEPARTMENT */}

          <div className="resource-filter-group">

            <span className="resource-filter-label">
              Department
            </span>

            <div className="resource-filter-pills">

              {departments.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    department === item
                      ? "resource-filter active"
                      : "resource-filter"
                  }
                  onClick={() =>
                    setDepartment(item)
                  }
                >
                  {item === "ALL"
                    ? "All Departments"
                    : item}
                </button>
              ))}

            </div>

          </div>

          {/* YEAR */}

          <div className="resource-filter-group">

            <span className="resource-filter-label">
              Year
            </span>

            <div className="resource-filter-pills">

              {years.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    year === item
                      ? "resource-filter active"
                      : "resource-filter"
                  }
                  onClick={() =>
                    setYear(item)
                  }
                >
                  {item === "ALL"
                    ? "All Years"
                    : item}
                </button>
              ))}

            </div>

          </div>

        </section>

        {/* RESULTS */}

        <section className="resources-results">

          <div className="resources-results-header">

            <div>

              <span className="section-label">
                RESOURCES
              </span>

              <h2>
                {category === "ALL"
                  ? "All Resources"
                  : formatCategory(category)}
              </h2>

            </div>

            <div className="resources-result-actions">

              <span>
                {filteredResources.length} result
                {filteredResources.length !== 1
                  ? "s"
                  : ""}
              </span>

              {(search ||
                category !== "ALL" ||
                department !== "ALL" ||
                year !== "ALL") && (

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>

              )}

            </div>

          </div>

          {filteredResources.length > 0 ? (

            <div className="resources-grid">

              {filteredResources.map((resource) => (

                <article
                  className="resource-page-card"
                  key={resource.id}
                >

                  <div className="resource-card-top">

                    <div className="resource-pdf-icon">
                      {getResourceType(resource)}
                    </div>

                    <span>
                      {resource.category
                        ?.replace("_", " ")}
                    </span>

                  </div>

                  <div className="resource-card-body">

                    <h3>
                      {resource.title}
                    </h3>

                    <p>
                      {resource.description ||
                        "No description available."}
                    </p>

                    <div className="resource-card-tags">

                      <span>
                        {resource.department ||
                          "ALL BRANCHES"}
                      </span>

                      <span>
                        {resource.year ||
                          "All Years"}
                      </span>

                    </div>

                  </div>

                  <div className="resource-card-meta">

                    <div>

                      <span>
                        Size
                      </span>

                      <strong>
                        {resource.size ||
                          "N/A"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Uploaded
                      </span>

                      <strong>
                        {resource.uploadedAt ||
                          "Recently"}
                      </strong>

                    </div>

                  </div>

                  <div className="resource-card-footer">

                    <span>
                      {resource.uploadedBy ||
                        "College"}
                    </span>

                    <div className="resource-actions">

                      <button
                        type="button"
                        className="resource-view-button"
                        onClick={() => {

                          if (resource.fileUrl) {
                            window.open(
                              resource.fileUrl,
                              "_blank"
                            );
                          } else {
                            alert(
                              "File URL is not available."
                            );
                          }

                        }}
                      >
                        View PDF
                      </button>

                      <button
                        type="button"
                        className="resource-download-button"
                        onClick={() =>
                          handleDownload(resource)
                        }
                      >
                        Download ↓
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="resources-empty">

              <div className="resources-empty-icon">
                📚
              </div>

              <h3>
                No resources found
              </h3>

              <p>
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Resources;