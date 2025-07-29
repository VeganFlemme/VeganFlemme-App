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
    
    const heading = screen.getByText(/Votre transition vegan simplifiée/i)
    expect(heading).toBeInTheDocument()
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
    
    expect(screen.getByText(/Menus Personnalisés/i)).toBeInTheDocument()
    expect(screen.getByText(/Suivi Nutritionnel/i)).toBeInTheDocument()
    expect(screen.getByText(/Impact Écologique/i)).toBeInTheDocument()
    expect(screen.getByText(/Panier Intelligent/i)).toBeInTheDocument()
  })

  it('renders the newsletter signup form', () => {
    render(<HomePage />)
    
    const emailInput = screen.getByPlaceholderText(/Votre adresse email/i)
    const signupButton = screen.getByText(/S'inscrire/i)
    
    expect(emailInput).toBeInTheDocument()
    expect(signupButton).toBeInTheDocument()
  })
})