import { SignIn } from '@clerk/nextjs'
import React from 'react'

function SignInPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
        <SignIn/>
    </div>
  )
}

export default SignInPage