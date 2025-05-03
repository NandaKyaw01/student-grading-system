import Link from 'next/link'
import React from 'react'

const HomePage = () => {
    return (
        <>
            <div>HomePage</div>
            <Link href="/auth/login"> Login</Link>
        </>
    )
}

export default HomePage