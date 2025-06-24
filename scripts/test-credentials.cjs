#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

async function testCredentials() {
  console.log('🧪 Testing DietWise Credentials\n');
  
  const results = {
    gemini: false,
    supabase: false,
    stripe: false,
    database: false
  };
  
  // Test Gemini API
  console.log('1️⃣ Testing Gemini API...');
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say "API key is valid" in exactly those words');
    const response = await result.response;
    const text = response.text();
    
    if (text.toLowerCase().includes('api key is valid')) {
      console.log('✅ Gemini API: Connected successfully');
      results.gemini = true;
    } else {
      console.log('⚠️ Gemini API: Unexpected response');
    }
  } catch (error) {
    console.log(`❌ Gemini API: ${error.message}`);
  }
  
  // Test Supabase
  console.log('\n2️⃣ Testing Supabase...');
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not found');
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Supabase: Connected successfully');
    results.supabase = true;
  } catch (error) {
    console.log(`❌ Supabase: ${error.message}`);
  }
  
  // Test Stripe
  console.log('\n3️⃣ Testing Stripe...');
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not found');
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test API key by fetching products
    const products = await stripe.products.list({ limit: 1 });
    console.log('✅ Stripe: Connected successfully');
    
    // Check for price IDs
    if (!process.env.STRIPE_PRICE_ID_MONTHLY || !process.env.STRIPE_PRICE_ID_YEARLY) {
      console.log('⚠️ Stripe: Price IDs not configured');
    } else {
      try {
        await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID_MONTHLY);
        await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID_YEARLY);
        console.log('✅ Stripe: Price IDs valid');
      } catch (error) {
        console.log('❌ Stripe: Invalid price IDs');
      }
    }
    
    results.stripe = true;
  } catch (error) {
    console.log(`❌ Stripe: ${error.message}`);
  }
  
  // Test Database URL format
  console.log('\n4️⃣ Testing Database Configuration...');
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found');
    }
    
    const dbUrl = new URL(process.env.DATABASE_URL);
    if (dbUrl.protocol !== 'postgresql:' && dbUrl.protocol !== 'postgres:') {
      throw new Error('Invalid database protocol');
    }
    
    console.log('✅ Database: URL format valid');
    console.log(`   Host: ${dbUrl.hostname}`);
    console.log(`   Database: ${dbUrl.pathname.slice(1)}`);
    results.database = true;
  } catch (error) {
    console.log(`❌ Database: ${error.message}`);
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`   Tests passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✨ All credentials are valid! Your application is ready to run.');
  } else {
    console.log('\n⚠️ Some credentials need attention. Please check the errors above.');
  }
  
  // Check for webhook secret
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('\n📌 Note: Stripe webhook secret not configured.');
    console.log('   This is needed for processing Stripe webhooks.');
    console.log('   Set it up at: https://dashboard.stripe.com/webhooks');
  }
}

// Run tests
testCredentials().catch(console.error);