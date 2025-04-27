import React from 'react'
import { SignUp } from "@clerk/clerk-react";

function Signup() {
  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#667085] hover:bg-[#667085] text-black",
            card: "shadow-xl rounded-2xl border border-[#667085]",
            socialButtonsBlockButton: "bg-[#97B4D0] text-[#667085]",
            headerTitle: "text-[#667085] font-bold",
          },
        }}
        fallbackRedirectUrl="/"
        signInUrl="/signin"
      />
    </div>
  )
}

export default Signup