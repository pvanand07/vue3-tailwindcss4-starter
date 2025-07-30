<template>
  <div class="min-h-screen bg-white relative">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div class="relative">
              <div class="flex items-center justify-center w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-lg">
                <Code class="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <span class="text-xs xs:text-sm sm:text-lg font-semibold text-gray-900">
              D Code
            </span>
          </div>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4 lg:space-x-8">
            <button class="px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              About
            </button>
            <button class="px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </button>
            <button class="px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </button>
            <div class="flex items-center space-x-2 lg:space-x-3">
              <Search class="w-4 h-4 lg:w-5 lg:h-5 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors" />
              <button 
                @click="$emit('getStarted')"
                class="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center space-x-1 xs:space-x-2">
            <button 
              @click="$emit('getStarted')"
              class="px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
            <button
              @click="isMobileMenuOpen = true"
              class="p-1.5 xs:p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu class="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" @click="isMobileMenuOpen = false">
        <div class="absolute right-0 top-0 w-56 xs:w-64 h-full bg-white shadow-xl" @click.stop>
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-sm xs:text-base font-semibold text-gray-900">Menu</span>
              <button
                @click="isMobileMenuOpen = false"
                class="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X class="w-4 h-4 xs:w-5 xs:h-5" />
              </button>
            </div>
          </div>
          <div class="py-4">
            <button
              v-for="item in ['About', 'Features', 'Pricing']"
              :key="item"
              class="w-full text-left px-4 py-3 text-sm xs:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div class="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 lg:py-24 text-center">
        <div class="space-y-4 xs:space-y-6 sm:space-y-8">
          <div class="inline-flex items-center px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 bg-gray-100 text-gray-800 rounded-full text-xs font-medium mb-3 xs:mb-4 sm:mb-6">
            <span>July 30, 2025 Product</span>
          </div>
          
          <div class="space-y-2 xs:space-y-3 sm:space-y-4">
            <h1 class="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-gray-900">
              Introducing D Code
            </h1>
            <p class="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              AI Building Code Assistant
            </p>
          </div>

          <div class="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 justify-center items-center px-4">
            <button 
              @click="$emit('getStarted')"
              class="w-full xs:w-auto px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 rounded-full text-sm xs:text-base sm:text-lg font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </button>
            <button class="w-full xs:w-auto border border-gray-300 px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 rounded-full text-sm xs:text-base sm:text-lg font-medium text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              Try for Work
              <ArrowRight class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div class="flex flex-col xs:flex-row items-center justify-center space-y-1 xs:space-y-0 xs:space-x-4 sm:space-x-8 text-xs text-gray-600">
            <div class="flex items-center space-x-2">
              <Shield class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span>14-day free trial</span>
            </div>
            <div class="flex items-center space-x-2">
              <Zap class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span>Instant activation</span>
            </div>
            <div class="flex items-center space-x-2">
              <Users class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click="showShareModal = false">
      <div class="bg-white rounded-xl shadow-lg max-w-sm xs:max-w-md w-full p-4 xs:p-6 mx-2" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base xs:text-lg font-semibold text-gray-900">Share D Code</h3>
          <button
            @click="showShareModal = false"
            class="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X class="w-4 h-4 xs:w-5 xs:h-5" />
          </button>
        </div>
        
        <p class="text-gray-600 mb-4 text-xs xs:text-sm">
          Share D Code with your colleagues and help them streamline their building code compliance.
        </p>
        
        <div class="space-y-3">
          <div class="flex items-center space-x-2 p-2 xs:p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              :value="shareUrl"
              readonly
              class="flex-1 bg-transparent text-xs xs:text-sm text-gray-700 outline-none"
            />
            <button
              @click="copyToClipboard(shareUrl)"
              class="px-2 xs:px-3 py-1 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors"
            >
              Copy
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-2 xs:gap-3">
            <button
              @click="openShareLink('twitter')"
              class="flex items-center justify-center space-x-1 xs:space-x-2 p-2 xs:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="text-xs xs:text-sm font-medium text-gray-700">Twitter</span>
            </button>
            
            <button
              @click="openShareLink('linkedin')"
              class="flex items-center justify-center space-x-1 xs:space-x-2 p-2 xs:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="text-xs xs:text-sm font-medium text-gray-700">LinkedIn</span>
            </button>
            
            <button
              @click="openShareLink('whatsapp')"
              class="flex items-center justify-center space-x-1 xs:space-x-2 p-2 xs:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="text-xs xs:text-sm font-medium text-gray-700">WhatsApp</span>
            </button>
            
            <button
              @click="openShareLink('email')"
              class="flex items-center justify-center space-x-1 xs:space-x-2 p-2 xs:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="text-xs xs:text-sm font-medium text-gray-700">Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div class="rounded-xl xs:rounded-2xl p-4 xs:p-6 sm:p-8 border bg-gradient-to-r from-orange-50 to-green-50 border-gray-200 shadow-sm">
          <p class="text-sm xs:text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700">
            D Code is an AI-powered compliance assistant trained to understand and reason through the full spectrum of Indian building regulations — including NBC 2016, IS codes, CRZ norms, environmental mandates, and state-specific bylaws like KMBR and KPBR. Built for AEC professionals, D Code engages in natural conversation, answers complex queries, challenges flawed assumptions, and provides context-aware, project-specific guidance across every regulation that governs construction in India.
          </p>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 sm:py-20 bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
          <div 
            v-for="(feature, index) in features" 
            :key="index" 
            class="rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border bg-white border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all"
          >
            <div class="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 xs:mb-3 sm:mb-4 border bg-gradient-to-br from-orange-100 to-green-100 border-gray-200">
              <component :is="feature.icon" class="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-700" />
            </div>
            <h3 class="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold mb-1 xs:mb-2 sm:mb-3 text-gray-900">
              {{ feature.title }}
            </h3>
            <p class="text-xs xs:text-sm sm:text-base leading-relaxed text-gray-600">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 sm:py-20 border-t border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 text-center">
          <div v-for="(stat, index) in stats" :key="index">
            <div class="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-gray-900">
              {{ stat.number }}
            </div>
            <div class="text-xs xs:text-sm sm:text-base text-gray-600">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-16 sm:py-20 border-t border-gray-200 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-2 xs:space-y-3 sm:space-y-4 mb-8 xs:mb-12 sm:mb-16">
          <h2 class="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Ready to Transform Your Building Code Workflow?
          </h2>
          <p class="text-sm xs:text-base sm:text-lg lg:text-xl text-gray-600 px-2">
            Join thousands of professionals who trust D Code for accurate, 
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
          <div 
            v-for="(testimonial, index) in testimonials" 
            :key="index" 
            class="rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 border bg-white border-gray-200"
          >
            <div class="flex items-center space-x-1 mb-2 xs:mb-3 sm:mb-4">
              <Star 
                v-for="i in testimonial.rating" 
                :key="i" 
                class="w-3 h-3 xs:w-4 xs:h-4 fill-current text-orange-400" 
              />
            </div>
            <p class="mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base text-gray-700">
              "{{ testimonial.content }}"
            </p>
            <div>
              <div class="font-semibold text-xs xs:text-sm sm:text-base text-gray-900">
                {{ testimonial.name }}
              </div>
              <div class="text-xs text-gray-600">
                {{ testimonial.role }}
              </div>
              <div class="text-xs text-gray-500">
                {{ testimonial.company }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-20 border-t border-gray-200 bg-white">
      <div class="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 text-center">
        <div class="space-y-4 xs:space-y-6 sm:space-y-8">
          <div class="space-y-2 xs:space-y-3 sm:space-y-4">
            <h2 class="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Ready to Transform Your Building Code Workflow?
            </h2>
            <p class="text-sm xs:text-base sm:text-lg lg:text-xl text-gray-600 px-2">
              Join thousands of professionals who trust Build Atlas for accurate, 
              instant building regulation guidance.
            </p>
          </div>

          <div class="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 justify-center px-4">
            <button 
              @click="$emit('getStarted')"
              class="w-full xs:w-auto px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 rounded-full text-sm xs:text-base sm:text-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Award class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              Start Free Trial
            </button>
            <button class="w-full xs:w-auto border border-gray-300 px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 rounded-full text-sm xs:text-base sm:text-lg font-semibold text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              Schedule Demo
              <ArrowRight class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div class="flex flex-col xs:flex-row items-center justify-center space-y-1 xs:space-y-0 xs:space-x-4 sm:space-x-8 pt-4 xs:pt-6 sm:pt-8">
            <div class="flex items-center space-x-2 text-gray-600">
              <CheckCircle class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span class="text-xs xs:text-sm sm:text-base">Free 14-day trial</span>
            </div>
            <div class="flex items-center space-x-2 text-gray-600">
              <CheckCircle class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span class="text-xs xs:text-sm sm:text-base">No credit card required</span>
            </div>
            <div class="flex items-center space-x-2 text-gray-600">
              <CheckCircle class="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span class="text-xs xs:text-sm sm:text-base">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-200 py-8 sm:py-12 bg-gradient-to-r from-orange-50 to-green-50">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
          <div class="space-y-2 xs:space-y-3 sm:space-y-4 xs:col-span-2 lg:col-span-1">
            <div class="flex items-center space-x-2 xs:space-x-3">
              <div class="flex items-center justify-center w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-lg">
                <Code class="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span class="text-xs xs:text-sm sm:text-base font-semibold text-gray-900">
                D Code
              </span>
            </div>
            <p class="text-xs text-gray-600">
              AI-powered building code compliance solutions for architects and engineers.
            </p>
          </div>
          
          <div>
            <h4 class="font-semibold mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base text-gray-900">
              Product
            </h4>
            <ul class="space-y-1 text-xs">
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Features</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Pricing</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">API</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-semibold mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base text-gray-900">
              Company
            </h4>
            <ul class="space-y-1 text-xs">
              <li><a href="#" class="text-gray-600 hover:text-gray-900">About</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Blog</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Careers</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-semibold mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base text-gray-900">
              Support
            </h4>
            <ul class="space-y-1 text-xs">
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Help Center</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Community</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Status</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-200 mt-4 xs:mt-6 sm:mt-8 pt-4 xs:pt-6 sm:pt-8 text-center text-xs">
          <p class="text-gray-600">
            &copy; 2025 D Code. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Code, 
  BookOpen, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Leaf,
  Calculator,
  FileText,
  Map,
  Zap,
  Globe,
  Award,
  Search,
  Play,
  Menu,
  X
} from 'lucide-vue-next'

// Define emits
const emit = defineEmits(['getStarted'])

// Reactive data
const isMobileMenuOpen = ref(false)
const showShareModal = ref(false)

// Computed properties
const shareUrl = computed(() => window.location.href)
const shareTitle = computed(() => "D Code - AI Building Code Assistant")
const shareText = computed(() => "Check out D Code, the AI-powered building code assistant for Indian regulations and compliance.")

// Static data
const features = [
  {
    icon: BookOpen,
    title: "Complete Code Database",
    description: "Access NBC 2016, IS codes, and regional building regulations in one comprehensive platform"
  },
  {
    icon: Leaf,
    title: "Green Certification",
    description: "IGBC and LEED calculators to achieve sustainable building certifications with ease"
  },
  {
    icon: Map,
    title: "Regional Compliance",
    description: "State-specific bylaws and municipal building rules for accurate local compliance"
  },
  {
    icon: FileText,
    title: "Smart Documentation",
    description: "AI-generated compliance checklists and report templates tailored to your project"
  },
  {
    icon: Shield,
    title: "Fire Safety Guidance",
    description: "Comprehensive fire safety requirements and NOC documentation support"
  },
  {
    icon: Calculator,
    title: "Advanced Calculations",
    description: "Structural load calculations, seismic analysis, and building performance metrics"
  }
]

const stats = [
  { number: "10,000+", label: "Active Professionals" },
  { number: "50,000+", label: "Queries Resolved" },
  { number: "99.9%", label: "Accuracy Rate" },
  { number: "24/7", label: "Availability" }
]

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Senior Architect",
    company: "Design Studio Mumbai",
    content: "This tool has revolutionized how we handle building code compliance. The accuracy and speed of responses are incredible.",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "Structural Engineer", 
    company: "Engineering Solutions Pvt Ltd",
    content: "The regional bylaws feature is a game-changer. No more hunting through multiple documents for compliance requirements.",
    rating: 5
  },
  {
    name: "Anita Patel",
    role: "Project Manager",
    company: "Green Building Consultants",
    content: "The IGBC and LEED calculators have streamlined our certification process significantly. Highly recommended!",
    rating: 5
  }
]

// Methods
const handleShare = () => {
  showShareModal.value = true
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

const openShareLink = (platform) => {
  const url = shareUrl.value
  const text = shareText.value
  const title = shareTitle.value
  
  switch (platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
      break
    case 'linkedin':
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
      break
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
      break
    case 'email':
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank')
      break
  }
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>