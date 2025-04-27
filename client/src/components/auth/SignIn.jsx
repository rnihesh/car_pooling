import React from 'react'
import { SignIn } from "@clerk/clerk-react";

function Signin() {
  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#E85F5C] hover:bg-[#667085] text-black",
            card: "shadow-xl rounded-2xl border border-[#667085]",
            headerTitle: "text-[#667085] font-bold",
          },
        }}
        fallbackRedirectUrl="/"
        signUpUrl="/signup"
      />
    </div>
  )
}

export default Signin