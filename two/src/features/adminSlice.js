import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
   _id: "",
  
   token: "",
};

const adminSlice = createSlice({
   name: "admin",
   initialState,
   reducers: {
      loginadmin: (state, action) => {
         const { _id, token } = action.payload;
         Cookies.set("admin", JSON.stringify(action.payload), { expires: 30 });
         state._id = _id;
         
         state.token = token;
      },
      logout: state => {
         Cookies.remove("admin");
         state._id = "";
       
      },
     
   },
});

export const { loginadmin, logout} = adminSlice.actions;

export default adminSlice.reducer;
