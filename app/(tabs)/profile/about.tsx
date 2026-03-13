import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { Layout } from '@/components/layout';
import { AuthHeader } from '@/components/auth-header';

export default function Screen() {
  return (
    <Layout
      useBackground
      stickyHeader={
        <View className="pb-4">
          <AuthHeader title="About Xervices" />
        </View>
      }>
      <View className="flex-1 gap-6">
        {/* About Xervices Intro */}
        <View className="gap-3">
          <Text className="text-[#737381]">
            Xervices Technologies Ltd is a Nigerian technology marketplace transforming how
            individuals and businesses access skilled professional services.
          </Text>
          <Text className="text-[#737381]">
            We built Xervices to solve a simple but widespread problem: finding reliable, verified,
            and skilled professionals quickly, safely, and transparently.
          </Text>
          <Text className="text-[#737381]">
            Through our mobile-first platform, we connect customers with independent, pre-screened
            professionals across a broad and expanding range of essential service categories. These
            include plumbing, electrical services, carpentry, automotive repair, logistics,
            locksmith services, towing, laundry, general handyman solutions, and many more.
          </Text>
          <Text className="text-[#737381]">
            Our platform is designed to continuously grow, enabling access to a diverse range of
            professional services as market needs evolve.
          </Text>
        </View>

        {/* Our Story */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Our Story</Text>
          <Text className="text-[#737381]">
            Xervices was born from the belief that finding reliable, skilled professionals in Africa
            should not be left to chance. Whether you are a homeowner fixing a leak or a business
            needing electrical repairs, the difficulty of finding trustworthy help has lasted for
            too long.
          </Text>
          <Text className="text-[#737381]">
            Our founders experienced this firsthand. We were frustrated customers making endless
            calls, unsure if help would arrive. At the same time, we saw talented artisans go days
            without work simply because they lacked access to consistent opportunities.
          </Text>
          <Text className="text-[#737381]">
            That is why we created Xervices to change this reality. Our platform makes it easy to
            connect with nearby, verified professionals with transparent pricing and a job
            guarantee.
          </Text>
          <Text className="text-[#737381]">
            We are not just building an app. We are building trust. We empower skilled professionals
            to grow sustainable businesses while giving customers peace of mind. Xervices exists so
            everyone can access quality services anytime and anywhere, and so no one's livelihood
            depends on luck.
          </Text>
        </View>

        {/* Who We Are */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Who We Are</Text>
          <Text className="text-[#737381]">
            Xervices is not a traditional service company. We are a technology infrastructure
            provider. We do not employ service professionals. Instead, we provide the digital
            backbone that enables independent professionals to:
          </Text>
          <View className="ml-4 gap-2">
            <Text className="text-[#737381]">• Connect with customers</Text>
            <Text className="text-[#737381]">• Negotiate pricing within the platform</Text>
            <Text className="text-[#737381]">• Receive secure digital payments</Text>
            <Text className="text-[#737381]">
              • Build trusted reputations through ratings and reviews
            </Text>
            <Text className="text-[#737381]">
              • Operate within a structured, compliant ecosystem
            </Text>
          </View>
          <Text className="text-[#737381]">
            By combining digital identity verification, in-app communication, secure payment
            processing, fraud controls, and performance tracking, we create a safer and more
            efficient marketplace for both customers and service providers.
          </Text>
        </View>

        {/* The Problem We're Solving */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">The Problem We're Solving</Text>
          <Text className="text-[#737381]">
            Nigeria's skilled labor market remains largely informal, fragmented, cash-driven, and
            trust-deficient.
          </Text>
          <View className="ml-4 gap-2">
            <Text className="text-[#737381]">
              • Customers struggle to find reliable professionals.
            </Text>
            <Text className="text-[#737381]">
              • Skilled workers lack structured access to demand, digital credibility, and secure
              payment systems.
            </Text>
            <Text className="text-[#737381]">
              • This inefficiency represents a massive opportunity within Nigeria's growing service
              economy.
            </Text>
          </View>
        </View>

        {/* Our Solution */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Our Solution</Text>
          <Text className="text-[#737381]">
            Xervices provides a structured marketplace infrastructure that enables:
          </Text>
          <View className="ml-4 gap-2">
            <Text className="text-[#737381]">• Real-time service discovery</Text>
            <Text className="text-[#737381]">• In-app price negotiation</Text>
            <Text className="text-[#737381]">• Secure digital payments</Text>
            <Text className="text-[#737381]">• Identity verification and KYC</Text>
            <Text className="text-[#737381]">• Ratings and performance tracking</Text>
            <Text className="text-[#737381]">• Structured dispute resolution</Text>
            <Text className="text-[#737381]">• Commission-based revenue generation</Text>
          </View>
          <Text className="text-[#737381]">
            We are building an asset-light, scalable marketplace model that empowers independent
            professionals while protecting customers.
          </Text>
        </View>

        {/* What Makes Xervices Different */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">What Makes Xervices Different</Text>

          <View className="gap-2">
            <Text className="text-black font-semibold">Technology-Driven Matching</Text>
            <Text className="text-[#737381]">
              Structured booking workflows and real-time coordination tools streamline service
              engagement.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-black font-semibold">Pricing Transparency</Text>
            <Text className="text-[#737381]">
              Providers set their own pricing, and customers negotiate before confirming bookings.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-black font-semibold">Secure Digital Payments</Text>
            <Text className="text-[#737381]">
              All transactions are processed through licensed payment partners, reducing cash risk
              and increasing accountability.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-black font-semibold">Independent Contractor Model</Text>
            <Text className="text-[#737381]">
              Service providers maintain control over pricing, availability, and operations while
              operating within a structured framework.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-black font-semibold">Built-In Trust Architecture</Text>
            <Text className="text-[#737381]">
              Escrow-style payment holding, proof-of-completion verification, ratings, and dispute
              management protect both sides of the marketplace.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-black font-semibold">Compliance & Data Protection</Text>
            <Text className="text-[#737381]">
              We operate in alignment with the Nigeria Data Protection Act (NDPA 2023) and
              applicable financial and marketplace regulations.
            </Text>
          </View>
        </View>

        {/* Built for Customers */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Built for Customers</Text>
          <View className="ml-4 gap-2">
            <Text className="text-[#737381]">• Verified service professionals</Text>
            <Text className="text-[#737381]">• Transparent and competitive pricing</Text>
            <Text className="text-[#737381]">• Real-time tracking with live status updates</Text>
            <Text className="text-[#737381]">
              • See when professionals are on the way with accurate ETA visibility
            </Text>
            <Text className="text-[#737381]">
              • Ability to compare prices, ratings, and professional strength before booking
            </Text>
            <Text className="text-[#737381]">• Secure in-app payments</Text>
            <Text className="text-[#737381]">• Structured dispute resolution</Text>
            <Text className="text-[#737381]">• Ratings and reviews</Text>
            <Text className="text-[#737381]">• Reduced fraud risk</Text>
          </View>
        </View>

        {/* Built for Professionals */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Built for Professionals</Text>
          <View className="ml-4 gap-2">
            <Text className="text-[#737381]">• Access to real demand</Text>
            <Text className="text-[#737381]">• Digital identity credibility</Text>
            <Text className="text-[#737381]">• Flexible pricing control</Text>
            <Text className="text-[#737381]">• Structured earnings system</Text>
            <Text className="text-[#737381]">• Secure payout mechanisms</Text>
            <Text className="text-[#737381]">• Reputation-building tools</Text>
          </View>
        </View>

        {/* Our Mission */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Our Mission</Text>
          <Text className="text-[#737381]">
            Empowering skilled professionals with a steady income while ensuring customers receive
            fast, transparent, and reliable services. We are building a trusted technology-driven
            ecosystem that modernizes access to professional services across emerging markets,
            creating sustainable economic opportunities that uplift professionals, protect
            customers, and strengthen entire communities.
          </Text>
        </View>

        {/* Our Vision */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Our Vision</Text>
          <Text className="text-[#737381]">
            To become Africa's leading on-demand skilled services marketplace, beginning in Nigeria
            and expanding across the continent, setting the standard for transparency, safety,
            professionalism, and digital inclusion while transforming how individuals and businesses
            connect with trusted professionals across both informal and semi-formal sectors.
          </Text>
        </View>

        {/* Our Commitment */}
        <View className="gap-3">
          <Text className="text-black text-lg font-semibold">Our Commitment</Text>
          <Text className="text-[#737381]">We are committed to:</Text>
          <View className="ml-4 gap-2">
            <Text className="text-[#737381]">
              • Building trust in Africa's skilled labor market
            </Text>
            <Text className="text-[#737381]">• Protecting user data and privacy</Text>
            <Text className="text-[#737381]">
              • Enabling economic opportunity for independent professionals
            </Text>
            <Text className="text-[#737381]">
              • Creating a structured, accountable service marketplace
            </Text>
          </View>
        </View>

        {/* Closing */}
        <View className="gap-3">
          <Text className="text-[#737381]">
            Xervices brings structure to an unstructured market, empowering professionals and
            instilling customer confidence in every booking.
          </Text>
          <Text className="text-[#737381]">
            The future of skilled services starts now. Book, work, and grow smarter with Xervices.
          </Text>
        </View>
      </View>
    </Layout>
  );
}
