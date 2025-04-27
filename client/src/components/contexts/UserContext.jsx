import { Children, createContext, useEffect, useState } from "react";
export const userContextObj = createContext();

function UserContext({ children }) {
  let [currentUser, setCurrentUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: "",
    role: ""
  });

  useEffect(() => {
    const userInStorage = localStorage.getItem("currentuser");
    if (userInStorage) {
      setCurrentUser(JSON.parse(userInStorage));
    }
  }, []);

  return (
    <userContextObj.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </userContextObj.Provider>
  );
}

export default UserContext;