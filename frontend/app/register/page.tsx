'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Loader as Loader2, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [tenantName, setTenantName] = React.useState('');
  const [tenantSlug, setTenantSlug] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required';
    else if (fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';

    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (!tenantName.trim()) errs.tenantName = 'Organization name is required';
    else if (tenantName.trim().length < 2) errs.tenantName = 'Name must be at least 2 characters';

    if (!tenantSlug.trim()) errs.tenantSlug = 'Organization slug is required';
    else if (!/^[a-z0-9-]+$/.test(tenantSlug)) errs.tenantSlug = 'Only lowercase letters, numbers, and hyphens';
    else if (tenantSlug.length < 3) errs.tenantSlug = 'Slug must be at least 3 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const { error } = await signUp(email, password, fullName, tenantName, tenantSlug);

    if (error) {
      setErrors({ general: error });
      setSubmitting(false);
      return;
    }

    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--primary))] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 font-bold text-lg">
              A
            </div>
            <span className="text-xl font-bold tracking-wider">AMDOX</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Start your<br />organization today
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Get up and running in minutes. Amdox ERP Suite gives your team the tools to manage finance, HR, supply chain, and projects from one platform.
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Free 14-day trial, no credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>You&apos;ll be the Tenant Admin with full access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Invite team members after signup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - registration form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                A
              </div>
              <span className="text-lg font-bold tracking-wider text-primary">AMDOX</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Set up your organization and admin account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errors.general}
                </div>
              )}

              {/* Personal info */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  className={errors.fullName ? 'border-destructive' : ''}
                  autoComplete="name"
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Organization */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Organization Details</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantName">Organization name</Label>
                <Input
                  id="tenantName"
                  placeholder="Acme Corporation"
                  value={tenantName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTenantName(val);
                    setTenantSlug(generateSlug(val));
                    if (errors.tenantName) setErrors((prev) => ({ ...prev, tenantName: '' }));
                    if (errors.tenantSlug) setErrors((prev) => ({ ...prev, tenantSlug: '' }));
                  }}
                  className={errors.tenantName ? 'border-destructive' : ''}
                />
                {errors.tenantName && <p className="text-xs text-destructive">{errors.tenantName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantSlug">Organization slug</Label>
                <Input
                  id="tenantSlug"
                  placeholder="acme-corporation"
                  value={tenantSlug}
                  onChange={(e) => {
                    setTenantSlug(e.target.value);
                    if (errors.tenantSlug) setErrors((prev) => ({ ...prev, tenantSlug: '' }));
                  }}
                  className={errors.tenantSlug ? 'border-destructive' : ''}
                />
                {errors.tenantSlug && <p className="text-xs text-destructive">{errors.tenantSlug}</p>}
                <p className="text-xs text-muted-foreground">
                  Used in URLs and integrations. Auto-generated from name.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create organization
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pb-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
