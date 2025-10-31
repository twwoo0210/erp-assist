import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function AccountSwitcher() {
  const { accounts, activeAccount, switchAccount } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (accounts.length <= 1) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
      >
        <span>{activeAccount?.name}</span>
        <i className={`ri-arrow-down-s-line transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    switchAccount(account)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                    activeAccount?.id === account.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-xs text-gray-500">{account.role}</div>
                  </div>
                  {activeAccount?.id === account.id && (
                    <i className="ri-check-line text-blue-600"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}