"use client";
import { signIn, signOut } from 'next-auth/react'

export default function LoginBtn(){
    return(
        <button
        className="login-btn"
        onClick={() => signIn()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
       <span>Login</span>
      </button>
    )
}

