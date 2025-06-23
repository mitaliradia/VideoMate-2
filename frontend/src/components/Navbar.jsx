import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { Link, useLocation } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BellIcon, LogOutIcon, ShipWheelIcon } from 'lucide-react';
import { logout } from '../lib/api';
import ThemeSelector from './ThemeSelector';

const Navbar = () => {
    const {authUser} = useAuthUser();
    const location = useLocation();
    const isChatPage = location.pathname?.startsWith('/chat');

    const queryClient = useQueryClient();

    //logout is super quick that's why no isPending state
    const {mutate: logoutMutation} = useMutation({
        mutationFn: logout,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['authUser']})
    })

    return (
        <nav className='bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center'>
            <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-end w-full'>
                    {/*LOGO - ONYL INT CHAT PAGE*/}
                    {isChatPage && (
                        <div className='pl-5'>
                            <Link to='/' className='flex items-center gap-2.5'>
                                <ShipWheelIcon className='size-9 text-primary' />
                                <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
                                    VideoMate
                                </span>
                            </Link>
                        </div>
                    )}

                    <div className='flex items-center gap-3 sm:gap-4 ml-auto'>
                        <Link to={'/notifications'}>
                        <button className='btn btn-ghost btn-circle'>
                            <BellIcon className='h-6 w-6 text-base-content opacity-70' />
                        </button>
                        </Link>
                    </div>

                    <ThemeSelector />

                    <div className='avatar'>
                        <div className='w-7 rounded-md'>
                            <img src={authUser?.profilePic} alt='Use Avatar' rel='noreferrer' />
                        </div>
                    </div>

                    {/*LOGOUT BUTTON*/}
                    <button className='btn btn-ghost btn-circle' onClick={logoutMutation}>
                        <LogOutIcon className='h-6 w-6 text-base-content opacity-70' />
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
