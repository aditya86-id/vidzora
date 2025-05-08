import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q");
  const navigate= useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/video/search?q=${query}`
        );
        // ✅ FIXED: Use response.data.data
        setResults(response.data.data || []);
        console.log(response.data.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearchResults();
  }, [query]);

  const handleVideo=(videoId)=>{
    navigate(`/watch/${videoId}`);
    console.log("Video clicked:", videoId)
      console.log(videoId)
  }

  return (
    <div style={{ color: "white", padding: 20 }} className="mt-[65px]">
      <h2>Search Results for "{query}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-white">No results found.</p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          className="w-fit cursor-pointer"
        >
          {results.map((item) => (
            <div
              key={item._id}
              style={{
                border: "1px solid",
                padding: 10,
                borderRadius: 10,
                backgroundColor: "#1e1e1e",
              }}
              onClick={() => handleVideo(item._id)}
            >
              <img
                src={item.thumbnail.url}
                alt={item.title}
                style={{ width: "100%", maxWidth: 400 }}
                className="rounded-xl"
              />
              <h3 className="font-semibold">{item.title}</h3>
              <p>Views: {item.views}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
