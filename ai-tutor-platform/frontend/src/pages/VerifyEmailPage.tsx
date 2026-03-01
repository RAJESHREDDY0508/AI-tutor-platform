import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { authService } from '@/services/authService';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const emailFromState = (location.state as { email?: string })?.email;

  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      setStatus('verifying');
      authService
        .verifyEmail(token)
        .then((res) => {
          setStatus('success');
          setMessage(res.message);
        })
        .catch((err: unknown) => {
          setStatus('error');
          setMessage(err instanceof Error ? err.message : 'Verification failed');
        });
    }
  }, [token]);

  const handleResend = async () => {
    if (!emailFromState) return;
    setResending(true);
    try {
      const res = await authService.resendVerification(emailFromState);
      setMessage(res.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  // No token — user just signed up, show "check your email" message
  if (!token) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent a verification link">
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            We've sent a verification email to{' '}
            <span className="font-medium text-gray-900">{emailFromState ?? 'your email'}</span>.
            Click the link in the email to verify your account.
          </p>
          {emailFromState && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't receive it? Resend"}
            </button>
          )}
          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}
          <div className="pt-2">
            <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Email Verification">
      <div className="space-y-4 text-center">
        {status === 'verifying' && (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">{message}</p>
            <Link
              to="/login"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Sign in to your account
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-red-600">{message}</p>
            <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
