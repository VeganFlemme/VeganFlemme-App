import { render, screen } from '@testing-library/react'
import HomePage from '../src/app/page'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Leaf: () => <div data-testid="leaf-icon" />,
  ChefHat: () => <div data-testid="chef-hat-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    
    // Check for the main heading text in the hero section
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Votre transition.*vegan.*simplifiée/i)
  })

  it('renders the VeganFlemme brand name', () => {
    render(<HomePage />)
    
    const brandName = screen.getAllByText('VeganFlemme')[0]
    expect(brandName).toBeInTheDocument()
  })

  it('renders the main CTA button', () => {
    render(<HomePage />)
    
    const ctaButton = screen.getByText(/Générer mon premier menu/i)
    expect(ctaButton).toBeInTheDocument()
  })

  it('renders the features section', () => {
    render(<HomePage />)
    
    // Find the features section specifically
    const featuresSection = screen.getByText(/Pourquoi choisir VeganFlemme/i)
    expect(featuresSection).toBeInTheDocument()
    
    // Check for feature headings - use more specific selectors
    const featureHeadings = screen.getAllByRole('heading', { level: 3 })
    const headingTexts = featureHeadings.map(h => h.textContent)
    
    expect(headingTexts).toContain('Menus Personnalisés')
    expect(headingTexts).toContain('Suivi Nutritionnel')
    expect(headingTexts).toContain('Impact Écologique')
    expect(headingTexts).toContain('Panier Intelligent')
  })

  it('renders the newsletter signup form', () => {
    render(<HomePage />)
    
    const emailInput = screen.getByPlaceholderText(/Votre adresse email/i)
    const signupButton = screen.getByText(/S'inscrire/i)
    
    expect(emailInput).toBeInTheDocument()
    expect(signupButton).toBeInTheDocument()
  })
})