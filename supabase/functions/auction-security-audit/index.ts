import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('Starting auction security audit...');

    const auditResults = {
      timestamp: new Date().toISOString(),
      checks: [],
      vulnerabilities: [],
      dataFixes: [],
      summary: {
        totalChecks: 0,
        vulnerabilitiesFound: 0,
        dataIssuesFixed: 0
      }
    };

    // 1. Check for data inconsistencies and fix them
    console.log('Running data consistency audit...');
    const { data: dataFixes, error: auditError } = await supabaseClient
      .rpc('audit_and_fix_auction_data');

    if (auditError) {
      console.error('Error running data audit:', auditError);
      auditResults.checks.push({
        name: 'Data Consistency Check',
        status: 'FAILED',
        error: auditError.message
      });
    } else {
      auditResults.dataFixes = dataFixes || [];
      auditResults.checks.push({
        name: 'Data Consistency Check',
        status: 'PASSED',
        issuesFixed: dataFixes?.length || 0
      });
      console.log(`Fixed ${dataFixes?.length || 0} data inconsistencies`);
    }

    // 2. Check for potential seller self-bidding (should be prevented by constraints now)
    console.log('Checking for seller self-bidding attempts...');
    const { data: selfBids, error: selfBidError } = await supabaseClient
      .from('bid_attempt_logs')
      .select('*')
      .eq('failure_reason', 'Sellers cannot bid on their own auctions')
      .gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (selfBidError) {
      console.error('Error checking self-bidding:', selfBidError);
      auditResults.checks.push({
        name: 'Seller Self-Bidding Check',
        status: 'FAILED',
        error: selfBidError.message
      });
    } else {
      auditResults.checks.push({
        name: 'Seller Self-Bidding Check',
        status: 'PASSED',
        attemptsBlocked: selfBids?.length || 0
      });
      if (selfBids && selfBids.length > 0) {
        auditResults.vulnerabilities.push({
          type: 'SELLER_SELF_BID_ATTEMPTS',
          severity: 'HIGH',
          count: selfBids.length,
          description: 'Attempted seller self-bidding (blocked by security controls)'
        });
      }
    }

    // 3. Check for expired auctions with active bids (should be prevented)
    console.log('Checking for bids on expired auctions...');
    const { data: expiredBids, error: expiredBidError } = await supabaseClient
      .from('bid_attempt_logs')
      .select('*')
      .eq('failure_reason', 'Auction has ended')
      .gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (expiredBidError) {
      console.error('Error checking expired auction bids:', expiredBidError);
      auditResults.checks.push({
        name: 'Expired Auction Bid Check',
        status: 'FAILED',
        error: expiredBidError.message
      });
    } else {
      auditResults.checks.push({
        name: 'Expired Auction Bid Check',
        status: 'PASSED',
        attemptsBlocked: expiredBids?.length || 0
      });
      if (expiredBids && expiredBids.length > 0) {
        auditResults.vulnerabilities.push({
          type: 'EXPIRED_AUCTION_BID_ATTEMPTS',
          severity: 'MEDIUM',
          count: expiredBids.length,
          description: 'Attempted bidding on expired auctions (blocked by security controls)'
        });
      }
    }

    // 4. Check for suspicious bidding patterns
    console.log('Checking for suspicious bidding patterns...');
    const { data: suspiciousBids, error: suspiciousError } = await supabaseClient
      .from('bids')
      .select(`
        user_id,
        listing_id,
        amount,
        maximum_bid,
        created_at,
        listings!inner(seller_id, title)
      `)
      .eq('status', 'active')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (suspiciousError) {
      console.error('Error checking suspicious patterns:', suspiciousError);
      auditResults.checks.push({
        name: 'Suspicious Pattern Check',
        status: 'FAILED',
        error: suspiciousError.message
      });
    } else {
      // Analyze patterns (this is a simplified check)
      const suspiciousPatterns = [];
      const userBidCounts = {};
      
      suspiciousBids?.forEach(bid => {
        userBidCounts[bid.user_id] = (userBidCounts[bid.user_id] || 0) + 1;
      });

      // Flag users with unusually high bidding activity
      Object.entries(userBidCounts).forEach(([userId, count]) => {
        if (count > 10) { // More than 10 bids in 24 hours
          suspiciousPatterns.push({
            type: 'HIGH_FREQUENCY_BIDDING',
            userId,
            count,
            description: `User placed ${count} bids in 24 hours`
          });
        }
      });

      auditResults.checks.push({
        name: 'Suspicious Pattern Check',
        status: 'PASSED',
        patternsFound: suspiciousPatterns.length
      });

      if (suspiciousPatterns.length > 0) {
        auditResults.vulnerabilities.push({
          type: 'SUSPICIOUS_BIDDING_PATTERNS',
          severity: 'LOW',
          patterns: suspiciousPatterns,
          description: 'Unusual bidding patterns detected'
        });
      }
    }

    // 5. Verify RLS policies are active
    console.log('Checking RLS policy status...');
    const { data: rlsStatus, error: rlsError } = await supabaseClient
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .in('tablename', ['bids', 'listings', 'offers'])
      .eq('schemaname', 'public');

    if (rlsError) {
      console.error('Error checking RLS status:', rlsError);
      auditResults.checks.push({
        name: 'RLS Policy Check',
        status: 'FAILED',
        error: rlsError.message
      });
    } else {
      const rlsDisabled = rlsStatus?.filter(table => !table.rowsecurity) || [];
      auditResults.checks.push({
        name: 'RLS Policy Check',
        status: rlsDisabled.length === 0 ? 'PASSED' : 'WARNING',
        tablesWithoutRLS: rlsDisabled.map(t => t.tablename)
      });

      if (rlsDisabled.length > 0) {
        auditResults.vulnerabilities.push({
          type: 'RLS_DISABLED',
          severity: 'CRITICAL',
          tables: rlsDisabled.map(t => t.tablename),
          description: 'Row Level Security is disabled on critical tables'
        });
      }
    }

    // Calculate summary
    auditResults.summary.totalChecks = auditResults.checks.length;
    auditResults.summary.vulnerabilitiesFound = auditResults.vulnerabilities.length;
    auditResults.summary.dataIssuesFixed = auditResults.dataFixes.length;

    console.log('Security audit completed:', auditResults.summary);

    // Log critical vulnerabilities
    const criticalVulns = auditResults.vulnerabilities.filter(v => v.severity === 'CRITICAL');
    if (criticalVulns.length > 0) {
      console.error('CRITICAL VULNERABILITIES FOUND:', criticalVulns);
    }

    return new Response(
      JSON.stringify(auditResults),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in security audit:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})