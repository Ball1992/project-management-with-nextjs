'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'minimal-shared/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthActions } from '../../hooks/use-auth-actions';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  
  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();

  const defaultValues = {
    email: 'demo@minimals.cc',
    password: 'demo1234',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      
      // ใช้ useAuthActions hook ที่รองรับ refresh token
      const result = await signIn({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        // Redirect to dashboard หรือหน้าที่ต้องการ
        router.push(paths.dashboard.root);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong!');
    }
  });

  const renderHead = (
    <Box sx={{ textAlign: 'center', mb: 5 }}>
      <Box component="h4" sx={{ mb: 1, typography: 'h4' }}>
        Sign in to your account
      </Box>
      <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
        Don't have an account?{' '}
        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
          Get started
        </Link>
      </Box>
    </Box>
  );

  const renderForm = (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link
        component={RouterLink}
        href="#"
        variant="body2"
        color="inherit"
        sx={{ alignSelf: 'flex-end' }}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
      >
        Sign in
      </LoadingButton>
    </Box>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      <Box sx={{ mt: 3, textAlign: 'center', typography: 'caption', color: 'text.secondary' }}>
        <Box component="div" sx={{ mb: 1 }}>
          🔐 This login form supports automatic token refresh
        </Box>
        <Box component="div">
          • Access token stored in sessionStorage
        </Box>
        <Box component="div">
          • Refresh token stored in httpOnly cookie
        </Box>
        <Box component="div">
          • Auto-retry failed requests after token refresh
        </Box>
      </Box>
    </>
  );
}
