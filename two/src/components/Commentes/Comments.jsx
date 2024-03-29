import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { fetchUsersByIDs } from "../../API";
import Comment from "../Comment/Comment";
import useFetch from "../../hooks/useFetch";
import "./comments.css";

const Comments = ({ article }) => {
   const { token } = JSON.parse(Cookies.get("user"));
   const [commentedUsers, setCommentedUsers] = useState([]);
   const [userIDs, setUserIDs] = useState([]);
   const customFetch = useFetch();

   useEffect(() => {
      const userIds = article?.comments?.map((comment) => comment.commentedBy);
      setUserIDs(userIds);
   }, [article?.comments]);

   useEffect(() => {
      (async () => {
         if (userIDs) {
            const data = await customFetch(fetchUsersByIDs, userIDs, token);
            if (data) setCommentedUsers(data.user);
         }
      })();
   }, [userIDs, token, customFetch]);

   return (
      <div className="comments">
         <h3>{article?.comments?.length} Comments</h3>
         {article?.comments?.map((comment, i) => (
            <Comment
               key={comment._id}
               comment={comment}
               user={commentedUsers.find((user) => user._id === comment.commentedBy)}
            />
         ))}
      </div>
   );
};

export default Comments;
