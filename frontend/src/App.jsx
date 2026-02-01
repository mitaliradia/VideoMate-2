import React from 'react'
import {Navigate,Route, Routes} from 'react-router';

import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import TranslationDemo from './pages/TranslationDemo.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CallPage from './pages/CallPage.jsx';
import toast,{ Toaster } from 'react-hot-toast';
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import Layout from './components/Layout.jsx';
import { useThemeStore } from './store/useThemeStore.js';

const App = () => {
  //axios
  //react query tanstack query
  const {isLoading, authUser} = useAuthUser();
  const {theme} = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if(isLoading) return <PageLoader />;
  

  return (
    <div className='min-h-screen bg-base-100' data-theme={theme}>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path='/' element={isAuthenticated  && isOnboarded ? (
          <Layout showSidebar={true}>
          <HomePage />
          </Layout>
          ) : (
            <Navigate to = {!isAuthenticated ? '/login' : '/onboarding'} />
          ) } />
        <Route 
          path='/signup'
          element={!isAuthenticated ? <SignUpPage /> : <Navigate to='/' />
          } 
        />
        <Route 
          path='/login' 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} />
          } 
        />
        <Route
          path='/onboarding'
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to='/' />
              )
            ) : (
              <Navigate to ='/login' />
            )
          }
        />
        <Route 
          path='/friends' 
          element={isAuthenticated && isOnboarded ? (
            <Layout showSidebar={true}>
              <FriendsPage />
            </Layout>
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
          )}
        />
        <Route 
          path='/translation-demo' 
          element={isAuthenticated && isOnboarded ? (
            <Layout showSidebar={true}>
              <TranslationDemo />
            </Layout>
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
          )}
        />
        <Route 
          path='/notifications' 
          element={isAuthenticated && isOnboarded ? (
            <Layout showSidebar={true}>
              <NotificationsPage />
            </Layout>
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
          )}
        />    
        <Route 
          path='/chat/:id' 
          element={isAuthenticated && isOnboarded ? (
            <Layout showSidebar={false}>
              <ChatPage />
            </Layout>
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
          )}
        />
        <Route 
          path='/call/:id' 
          element={isAuthenticated && isOnboarded ? (
            
              <CallPage />
          
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
          )}
        />
        {/* Catch-all route for undefined paths */}
        <Route 
          path='*' 
          element={<Navigate to='/' replace />}
        />
      </Routes>
      
    </div>
  )
}

export default App
