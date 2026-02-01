import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getUserFriends } from '../lib/api';
import { Link } from 'react-router';
import FriendCard from '../components/FriendCard';
import NoFriendsFound from '../components/NoFriendsFound';
import { UsersIcon, UserPlusIcon } from 'lucide-react';

const FriendsPage = () => {
  const {data:friends=[],isLoading: loadingFriends} = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends
  })

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='container mx-auto space-y-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>My Friends</h1>
            <p className='text-base-content opacity-70 mt-1'>
              Connect and chat with your language exchange partners
            </p>
          </div>
          <div className='flex gap-3'>
            <Link to='/notifications' className='btn btn-outline btn-sm'>
              <UsersIcon className='mr-2 size-4' />
              Friend Requests
            </Link>
            <Link to='/' className='btn btn-primary btn-sm'>
              <UserPlusIcon className='mr-2 size-4' />
              Find New Friends
            </Link>
          </div>
        </div>

        {loadingFriends ? (
          <div className='flex justify-center py-12'>
            <span className='loading loading-spinner loading-lg' />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
            <div className='text-center text-base-content opacity-70'>
              {friends.length} friend{friends.length !== 1 ? 's' : ''} total
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FriendsPage