import React from 'react'
import { LANGUAGE_TO_FLAG } from '../constants';
import { Link } from 'react-router';

const FriendCard = ({friend}) => {
  return (
    <div className='card bg-base-200 hover:shadow-md transition-shadow'>
      <div className='card-body p-4'>

        {/*USER INFO*/}
        <div className='avatar size-12'>
          <img src={friend.profilePic} alt={friend.fullName} />
        </div>
        <h3 className='front-semibold tuncate'>{friend.fullName}</h3>
      </div>

      <div className='flex flex-wrap gap-1.5 mb-3'>
        <span className='badge badge-secondary text-xs'>
          {getLanguageFlag(friend.nativeLanguage)}
          Native: {friend.nativeLanguage}
        </span>
        <span className='badge badge-outline text-xs'>
          {getLanguageFlag(friend.learningLanguage)}
          Learning: {friend.learningLanguage}
        </span>
      </div>

      <Link to={`/chat/${friend._id}`} className='btn btn-outline w-full'>
        Message
      </Link>
      
    </div>
  )
}

export default FriendCard;

export function getLanguageFlag(language){
  if(!language) return null;

  const langLower=language.toLowerCase();
  const countryCode=LANGUAGE_TO_FLAG[langLower];
  const flagUpper = countryCode?.toUpperCase();

  if(countryCode){
    return (
      <img
        src={`https://flagsapi.com/${flagUpper}/flat/64.png`}
        alt={`${langLower} flag`}
        className='h-3 mr-1 inline-block' />
    )
  }
  return null;
}
