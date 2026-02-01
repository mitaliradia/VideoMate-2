import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { getRecommendedUsers, getOutgoingFriendReqs, sendFriendRequest } from '../lib/api';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, StarIcon, BellIcon } from 'lucide-react';
import { Link } from 'react-router';
import { getLanguageFlag } from '../components/FriendCard';
import useAuthUser from '../hooks/useAuthUser';

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsId, setOutgoingRequestsIds] = useState(new Set());
  const { authUser } = useAuthUser();

  // Function to check language match quality
  const getLanguageMatchType = (user) => {
    if (!authUser) return 'none';
    
    // Convert to lowercase for case-insensitive comparison
    const userNative = user.nativeLanguage?.toLowerCase();
    const userLearning = user.learningLanguage?.toLowerCase();
    const myNative = authUser.nativeLanguage?.toLowerCase();
    const myLearning = authUser.learningLanguage?.toLowerCase();
    
    console.log('Checking match for:', user.fullName);
    console.log('User languages:', { native: userNative, learning: userLearning });
    console.log('My languages:', { native: myNative, learning: myLearning });
    
    const perfectMatch = userNative === myLearning && userLearning === myNative;
    const partialMatch = userNative === myLearning || userLearning === myNative;
    
    console.log('Match results:', { perfectMatch, partialMatch });
    
    if (perfectMatch) return 'perfect';
    if (partialMatch) return 'partial';
    return 'none';
  };

  const {data:recommendedUsers=[],isLoading: loadingUsers} = useQuery({
    queryKey: ['users'],
    queryFn: getRecommendedUsers
  })

  const {data:outgoingFriendReqs} = useQuery({
    queryKey: ['outgoingFriendReqs'],
    queryFn: getOutgoingFriendReqs
  })

  const {mutate:sendRequestMutation, isPending} = useMutation({
      mutationFn: sendFriendRequest,
      onSuccess: () => queryClient.invalidateQueries({queryKey:['outgoingFriendReqs']})
  })

  useEffect(() => {
    const outgoingIds = new Set()
    if(outgoingFriendReqs && outgoingFriendReqs.length>0){
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id)
      })
      setOutgoingRequestsIds(outgoingIds);
    }
  },[outgoingFriendReqs])
  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='container mx-auto space-y-10'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Discover Language Partners</h1>
            <p className='text-base-content opacity-70 mt-1'>
              Find perfect language exchange partners based on your learning goals
            </p>
          </div>
          <div className='flex gap-3'>
            <Link to='/friends' className='btn btn-outline btn-sm'>
              <UsersIcon className='mr-2 size-4' />
              My Friends
            </Link>
            <Link to='/notifications' className='btn btn-primary btn-sm'>
              <BellIcon className='mr-2 size-4' />
              Friend Requests
            </Link>
          </div>
        </div>

        <section>
          <div className='mb-6 sm:mb-8'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Recommended for You</h2>
                <p className='opacity-70'>
                  Smart matches based on your language learning goals
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
          <div className='flex justify-center justify-content py-12'>
            <span className='loading loading-spinner loading-lg' />
          </div>
          ) : recommendedUsers.length===0 ? (
            <div className='card bg-base-200 p-6 text-center'>
              <h3 className='font-semibold text-lg mb-2'>No recommendations available</h3>
              <p className='text-base-content opacity-70'>
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsId.has(user._id);
                return(
                  <div key={user._id} 
                  className='card bg-base-200 hover:shadow-lg transition-all duration-300'>
                    <div className='card-body p-5 space-y-4'>
                      <div className='flex items-center gap-3'>
                        <div className='avatar size-12'>
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>
                        <div>
                          <h3 className='font-semibold text-lg'>{user.fullName}</h3>
                          {user.location && (
                            <div className='flex items-center text-xs opacity-70 mt-1'>
                              <MapPinIcon className='size-3 mr-1' />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/*Language Match Indicator*/}
                      {(() => {
                        const matchType = getLanguageMatchType(user);
                        
                        if (matchType === 'perfect') {
                          return (
                            <div className='flex items-center gap-1 text-green-600 text-sm font-medium'>
                              <StarIcon className='size-4 fill-current' />
                              Perfect Language Match!
                            </div>
                          );
                        } else if (matchType === 'partial') {
                          return (
                            <div className='flex items-center gap-1 text-blue-600 text-sm'>
                              <StarIcon className='size-4' />
                              Good Language Match
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/*Languages with flags*/}
                      <div className='flex flex-wrap gap-1.5'>
                        <span className='badge badge-secondary'>
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className='badge badge-outline text-xs'>
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {user.learningLanguage}
                        </span>
                      </div>

                      {user.bio && <p className='text-sm opacity-70'>{user.bio}</p>}

                      {/*Action button*/}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? 'btn-disabled' : 'btn-primary'
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className='size-4 mr-2' />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className='size-4 mr-2' />
                            Send Friend Request
                          </>
                        ) }
                      </button>
                    </div>
                  </div>
              

                )
              })}
              </div>
          )}
        
        </section>
      </div>
      
    </div>
  )
}

export default HomePage;

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
