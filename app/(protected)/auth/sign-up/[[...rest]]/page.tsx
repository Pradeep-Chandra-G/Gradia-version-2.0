import { SignUp } from '@clerk/nextjs'
import React from 'react'

function SignUpPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
        <SignUp/>
    </div>
  )
}

export default SignUpPage