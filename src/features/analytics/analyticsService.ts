import { supabase } from '@/shared/lib/supabase'
export type AnalyticsPeriod='day'|'week'|'month'|'year'
export type AnalyticsItem={label:string;value:number}
export type AnalyticsPoint={bucket:string;views:number;visitors:number;leads:number}
export type AnalyticsData={views:number;visitors:number;sessions:number;leads:number;previousViews:number;series:AnalyticsPoint[];sources:AnalyticsItem[];devices:AnalyticsItem[];browsers:AnalyticsItem[];languages:AnalyticsItem[]}
export async function getWebsiteAnalytics(period:AnalyticsPeriod){const{data,error}=await supabase.rpc('get_website_analytics',{p_period:period});if(error)throw error;return data as AnalyticsData}
