import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { listAlerts, createAlert, pauseAlert, resumeAlert, deleteAlert } from '@/services/alerts';
import {
  Bell,
  Plus,
  Loader2,
  Play,
  Pause,
  Trash2,
  Mail,
  Webhook,
  Activity,
  CheckCircle,
  Building,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Zod Validation Schema matching FastAPI AlertCreate
const alertSchema = zod.object({
  companyDomain: zod.string().min(1, 'Company domain is required'),
  alertType: zod.enum(['headcount_growth', 'funding', 'hiring']),
  thresholdValue: zod.number().min(1, 'Threshold must be at least 1%'),
  notifyEmail: zod.string().email('Please enter a valid email address'),
  notifyWebhook: zod.string().url('Please enter a valid webhook URL').optional().or(zod.literal(''))
});

type AlertFormInputs = zod.infer<typeof alertSchema>;

export function Alerts() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

  // 1. Fetch active alerts from backend
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: listAlerts
  });

  // 2. React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AlertFormInputs>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      alertType: 'headcount_growth',
      thresholdValue: 15,
      notifyEmail: 'demo@intelliscope.ai',
      notifyWebhook: ''
    }
  });

  // 3. Create Alert mutation
  const createMutation = useMutation({
    mutationFn: (input: any) => createAlert(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`Rule saved: ${data.alert_type.replace('_', ' ')} alert for ${data.company_name}`);
      setFormOpen(false);
      reset();
    }
  });

  // 4. Pause Alert mutation
  const pauseMutation = useMutation({
    mutationFn: (id: number) => pauseAlert(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.info(`Alert for ${data.company_name} paused`);
    }
  });

  // 5. Resume Alert mutation
  const resumeMutation = useMutation({
    mutationFn: (id: number) => resumeAlert(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`Alert for ${data.company_name} resumed`);
    }
  });

  // 6. Delete Alert mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert rule deleted successfully');
    }
  });

  const onSubmit = (data: AlertFormInputs) => {
    // Dynamically capitalize name from domain (e.g. vercel.com -> Vercel)
    const rawName = data.companyDomain.split('.')[0];
    const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    
    createMutation.mutate({
      company_domain: data.companyDomain,
      company_name: capitalizedName,
      alert_type: data.alertType,
      threshold: { value: data.thresholdValue },
      notify_email: data.notifyEmail,
      notify_webhook: data.notifyWebhook || null
    });
  };

  const handleAutocomplete = (domain: string) => {
    setValue('companyDomain', domain);
  };


  const alertSignalLogs: any[] = [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[32px] font-black tracking-tight leading-none text-white">
            Alert Rules
          </h1>
          <p className="text-[13.5px] text-text-secondary mt-2">
            Configure signals to receive email or webhook triggers when headcounts, hirings, or funding levels exceed benchmarks.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white transition text-[12.5px] font-bold cursor-pointer shadow-lg shadow-accent/20 outline-none shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert Rule</span>
        </button>
      </div>

      {/* --- FORM SECTION --- */}
      {formOpen && (
        <div className="glass-panel rounded-2xl p-5 border border-accent/20 shadow-xl max-w-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-white/6 pb-3 mb-5">
            <h3 className="text-[14px] font-bold text-white">Configure Alert Signal</h3>
            <button
              onClick={() => setFormOpen(false)}
              className="text-[11.5px] text-text-secondary hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5">
            {/* Target Company Domain */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Target Company Domain
              </label>
              <input
                type="text"
                placeholder="e.g. stripe.com, vercel.com"
                {...register('companyDomain')}
                className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white"
              />
              {errors.companyDomain && (
                <span className="text-[10px] text-error font-medium">{errors.companyDomain.message}</span>
              )}
              {/* Autocomplete helper */}
              <div className="flex items-center gap-2 mt-1.5 overflow-x-auto py-1">
                <span className="text-[9.5px] text-text-secondary shrink-0 font-medium">Quick Select:</span>
                {['openai.com', 'supabase.com', 'resend.com', 'stripe.com'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleAutocomplete(d)}
                    className="px-2 py-1 rounded bg-white/4 border border-white/6 text-[10px] text-text-secondary hover:text-white transition cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Signal Category
              </label>
              <select
                {...register('alertType')}
                className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white"
              >
                <option value="headcount_growth">Headcount Growth Rate</option>
                <option value="funding">Funding Milestones</option>
                <option value="hiring">Hiring Announcements</option>
              </select>
            </div>

            {/* Threshold value */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Trigger Threshold Boundary (%)
              </label>
              <input
                type="number"
                placeholder="e.g. 15"
                {...register('thresholdValue', { valueAsNumber: true })}
                className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white font-mono"
              />
              {errors.thresholdValue && (
                <span className="text-[10px] text-error font-medium">{errors.thresholdValue.message}</span>
              )}
            </div>

            {/* Notify Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Notification Email Address
              </label>
              <input
                type="email"
                placeholder="demo@intelliscope.ai"
                {...register('notifyEmail')}
                className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white"
              />
              {errors.notifyEmail && (
                <span className="text-[10px] text-error font-medium">{errors.notifyEmail.message}</span>
              )}
            </div>

            {/* Notify Webhook */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Outgoing Webhook URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://api.yourdomain.com/webhooks/crustdata"
                {...register('notifyWebhook')}
                className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white"
              />
              {errors.notifyWebhook && (
                <span className="text-[10px] text-error font-medium">{errors.notifyWebhook.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 bg-accent hover:bg-accent/90 disabled:bg-accent/40 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-accent/15"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Save Alert Rules</span>
            </button>
          </form>
        </div>
      )}

      {/* --- ALERTS DASHBOARD DUAL COLUMN SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: List of set rules */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h3 className="text-[14px] font-extrabold text-white flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-accent" />
            <span>Configured Signal Rules</span>
          </h3>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="py-12 text-[13px] text-error font-medium text-center">
              Failed to retrieve active alerts database records.
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <div className="py-12 text-center text-text-secondary bg-[#111214]/50 border border-dashed border-white/8 rounded-2xl p-6">
              <AlertTriangle className="w-8 h-8 opacity-30 text-accent mb-2.5 mx-auto animate-pulse" />
              <p className="text-[12px] font-semibold text-white">No custom alert rules found</p>
              <p className="text-[10.5px] text-text-secondary mt-1">
                Click the "New Alert Rule" button above to establish your first signal monitor.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {alerts.map((al) => {
                const isActive = al.status === 'ACTIVE';

                return (
                  <div
                    key={al.id}
                    className={cn(
                      "glass-panel rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border hover:border-white/10 transition-colors",
                      !isActive && "opacity-60 bg-white/1"
                    )}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                          isActive
                            ? "bg-accent/10 border-accent/20 text-accent shadow-[0_2px_8px_rgba(124,92,252,0.1)]"
                            : "bg-white/2 border-white/4 text-text-secondary"
                        )}
                      >
                        <Bell className="w-5 h-5" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-[13.5px] font-bold text-white truncate leading-snug">
                          {al.company_name} ({al.company_domain})
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-text-secondary font-medium">
                          <span className="capitalize text-accent">{al.alert_type.replace('_', ' ')}</span>
                          <span className="w-1 h-1 rounded-full bg-white/12" />
                          <span className="font-mono">Threshold: {al.threshold?.value || 10}%</span>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap gap-2.5 mt-2.5">
                          {al.notify_email && (
                            <div className="flex items-center gap-1 text-[9.5px] text-text-secondary">
                              <Mail className="w-3.5 h-3.5 text-accent" />
                              <span>{al.notify_email}</span>
                            </div>
                          )}
                          {al.notify_webhook && (
                            <div className="flex items-center gap-1 text-[9.5px] text-text-secondary">
                              <Webhook className="w-3.5 h-3.5 text-accent" />
                              <span className="truncate max-w-[120px]">{al.notify_webhook}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Play/Pause Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isActive ? (
                        <button
                          onClick={() => pauseMutation.mutate(al.id)}
                          className="p-2 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/10 text-text-secondary hover:text-white transition cursor-pointer"
                          title="Pause Rule"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => resumeMutation.mutate(al.id)}
                          className="p-2 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/10 text-text-secondary hover:text-white transition cursor-pointer"
                          title="Resume Rule"
                        >
                          <Play className="w-4 h-4 fill-white" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteMutation.mutate(al.id)}
                        className="p-2 rounded-xl bg-error/10 border border-error/15 hover:bg-error/15 hover:border-error/25 text-error transition cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Real-time Signal logs */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <h3 className="text-[14px] font-extrabold text-white flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-success" />
            <span>Fired Alarm Logs</span>
          </h3>

          <div className="glass-panel rounded-2xl p-4.5 shadow-md flex flex-col gap-4">
            {alertSignalLogs.length === 0 ? (
              <div className="py-12 text-center text-text-secondary bg-[#111214]/50 border border-dashed border-white/8 rounded-2xl p-6">
                <AlertTriangle className="w-8 h-8 opacity-30 text-accent mb-2.5 mx-auto animate-pulse" />
                <p className="text-[12px] font-semibold text-white">No fired alarms yet</p>
                <p className="text-[10.5px] text-text-secondary mt-1">
                  We'll notify you here when any signal rules are triggered.
                </p>
              </div>
            ) : (
              alertSignalLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-3.5 border-b border-white/6 last:border-b-0 last:pb-0"
                >
                  <div className="w-7.5 h-7.5 rounded-lg bg-success/10 border border-success/15 text-success flex items-center justify-center shrink-0 mt-0.5">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[12px] font-bold text-white leading-tight">
                        {log.company}
                      </span>
                      <span className="text-[9.5px] text-text-secondary shrink-0 font-mono">{log.time}</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-accent uppercase tracking-wider">{log.type}</span>
                    <p className="text-[10.5px] text-text-secondary leading-normal mt-1">{log.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Alerts;
