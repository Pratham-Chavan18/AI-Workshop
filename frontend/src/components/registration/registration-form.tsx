import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useColleges } from '@/hooks/useColleges';
import { registerStudent } from '@/services/registration.service';
import { College } from '@/types/registration';
import { Sparkles, Building2, Check, AlertCircle, Loader2 } from 'lucide-react';

const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  // NOTE: Regexes and validation rules are aligned with backend/src/validators/registration.validator.ts and must be kept in sync.
  phone: z
    .string()
    .refine(
      (val) => !val || /^(\+?[1-9]\d{9,14}|0\d{9,14})$/.test(val.replace(/\s+/g, '')),
      'Provide 10-15 digits (E.164 with optional +) or a local number starting with 0'
    )
    .optional(),
  collegeId: z.string().uuid('Please select your college from the search list'),
  graduationYear: z.coerce
    .number()
    .int()
    .min(2024, 'Year must be 2024 or later')
    .max(2028, 'Year must be 2028 or earlier'),
  referralCode: z
    .string()
    .refine(
      (val) => !val || /^[A-Z0-9]{6,8}$/.test(val.trim().toUpperCase()),
      'Referral code must be 6-8 uppercase alphanumeric characters'
    )
    .optional(),
});

type FormValues = z.infer<typeof registrationSchema>;

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';

  const [collegeSearchText, setCollegeSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedCollegeIndex, setFocusedCollegeIndex] = useState(-1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { colleges, isLoading: isSearchingColleges } = useColleges(collegeSearchText);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      collegeId: '',
      graduationYear: 2025,
      referralCode: refFromUrl,
    },
  });

  const selectedCollegeId = watch('collegeId');

  // If URL contains referral code, initialize
  useEffect(() => {
    if (refFromUrl) {
      setValue('referralCode', refFromUrl.toUpperCase());
    }
  }, [refFromUrl, setValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCollege = (college: College) => {
    setValue('collegeId', college.id, { shouldValidate: true });
    setCollegeSearchText(college.name);
    setIsDropdownOpen(false);
    setFocusedCollegeIndex(-1);
  };

  const handleKeyDownCombobox = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || colleges.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedCollegeIndex((prev) => (prev + 1) % colleges.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedCollegeIndex((prev) => (prev - 1 + colleges.length) % colleges.length);
    } else if (e.key === 'Enter') {
      if (focusedCollegeIndex >= 0 && focusedCollegeIndex < colleges.length) {
        e.preventDefault();
        handleSelectCollege(colleges[focusedCollegeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setFocusedCollegeIndex(-1);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone ? values.phone.replace(/\s+/g, '').trim() : undefined,
        collegeId: values.collegeId,
        graduationYear: values.graduationYear,
        referralCode: values.referralCode ? values.referralCode.trim().toUpperCase() : undefined,
        source: refFromUrl ? 'whatsapp' : 'direct',
      };

      const result = await registerStudent(payload);
      const user = result.user;

      navigate(`/dashboard?code=${user.referralCode}`);
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information and try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Referral Code Banner */}
      {refFromUrl && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>Referral Code Applied: {refFromUrl.toUpperCase()}</span>
          </div>
          <Badge variant="default" className="text-[10px] py-0 px-1.5">
            Credit Active
          </Badge>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1">
        <label htmlFor="reg-fullname" className="text-xs font-semibold text-foreground">
          Full Name <span className="text-primary">*</span>
        </label>
        <Input
          id="reg-fullname"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullname-error' : undefined}
          placeholder="e.g. Rahul Sharma"
          {...register('fullName')}
        />
        {errors.fullName && (
          <p id="fullname-error" className="text-xs text-rose-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1">
        <label htmlFor="reg-email" className="text-xs font-semibold text-foreground">
          College / Personal Email <span className="text-primary">*</span>
        </label>
        <Input
          id="reg-email"
          type="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          placeholder="e.g. rahul@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-rose-500">{errors.email.message}</p>
        )}
      </div>

      {/* College Autocomplete */}
      <div className="space-y-1 relative" ref={dropdownRef}>
        <input type="hidden" {...register('collegeId')} />
        <label htmlFor="reg-college" className="text-xs font-semibold text-foreground">
          Engineering College / University <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Input
            id="reg-college"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isDropdownOpen && collegeSearchText.trim().length >= 2}
            aria-controls="college-listbox"
            aria-activedescendant={focusedCollegeIndex >= 0 ? `college-option-${focusedCollegeIndex}` : undefined}
            aria-invalid={!!errors.collegeId}
            aria-describedby={errors.collegeId ? 'college-error' : undefined}
            value={collegeSearchText}
            onChange={(e) => {
              setCollegeSearchText(e.target.value);
              setIsDropdownOpen(true);
              setFocusedCollegeIndex(-1);
              if (selectedCollegeId) {
                setValue('collegeId', '', { shouldValidate: true });
              }
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDownCombobox}
            placeholder="Type your college name (e.g. IIT, NIT, BITS)..."
            className="pr-10"
          />
          <div className="absolute right-3 top-3 text-muted-foreground">
            {isSearchingColleges ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : selectedCollegeId ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Building2 className="w-5 h-5 text-muted-foreground/60" />
            )}
          </div>
        </div>

        {/* Autocomplete dropdown options */}
        {isDropdownOpen && collegeSearchText.trim().length >= 2 && (
          <div
            id="college-listbox"
            role="listbox"
            className="absolute z-50 left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-border/60"
          >
            {colleges.length > 0 ? (
              colleges.map((c, idx) => (
                <button
                  type="button"
                  key={c.id}
                  id={`college-option-${idx}`}
                  role="option"
                  aria-selected={selectedCollegeId === c.id}
                  onClick={() => handleSelectCollege(c)}
                  className={`w-full text-left p-3 text-xs sm:text-sm text-foreground flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    focusedCollegeIndex === idx ? 'bg-muted ring-1 ring-primary' : 'hover:bg-muted'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    {(c.city || c.state) && (
                      <p className="text-xs text-muted-foreground">
                        {[c.city, c.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  {selectedCollegeId === c.id && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-xs text-muted-foreground text-center">
                No matching college found. Search "Other" to register manually.
              </div>
            )}
          </div>
        )}

        {errors.collegeId && (
          <p id="college-error" className="text-xs text-rose-500">Please select your college from the list</p>
        )}
      </div>

      {/* Graduation Year & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Graduation Year */}
        <div className="space-y-1">
          <label htmlFor="reg-gradyear" className="text-xs font-semibold text-foreground">
            Graduation Year <span className="text-primary">*</span>
          </label>
          <select
            id="reg-gradyear"
            {...register('graduationYear', { valueAsNumber: true })}
            className="flex h-11 w-full rounded-button border border-input bg-background px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value={2025}>2025 (Final Year)</option>
            <option value={2026}>2026 (Pre-Final Year)</option>
            <option value={2027}>2027</option>
            <option value={2028}>2028</option>
            <option value={2024}>2024 (Recent Grad)</option>
          </select>
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label htmlFor="reg-phone" className="text-xs font-semibold text-foreground">
            WhatsApp Number <span className="text-muted-foreground text-[10px]">(Optional)</span>
          </label>
          <Input
            id="reg-phone"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            placeholder="e.g. +91 9876543210"
            {...register('phone')}
          />
          {errors.phone && (
            <p id="phone-error" className="text-xs text-rose-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Referral Code input (if not already applied from URL) */}
      {!refFromUrl && (
        <div className="space-y-1">
          <label htmlFor="reg-refcode" className="text-xs font-semibold text-foreground">
            Referral Code <span className="text-muted-foreground text-[10px]">(Optional)</span>
          </label>
          <Input
            id="reg-refcode"
            placeholder="e.g. AIWX1"
            className="uppercase font-mono"
            {...register('referralCode')}
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={submitting || isSubmitting}
        className="w-full mt-4 h-12 text-sm sm:text-base font-semibold"
      >
        {submitting || isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Securing Your Free Seat...</span>
          </span>
        ) : (
          <span>Confirm Free Workshop Registration →</span>
        )}
      </Button>

      <p className="text-[11px] text-center text-muted-foreground pt-2">
        🔒 By registering, you agree to receive workshop links and updates. Your contact info is kept strictly private; peer referrals display a privacy-safe abbreviated name (e.g. First L.) on the campus leaderboard.
      </p>
    </form>
  );
};

export default RegistrationForm;

