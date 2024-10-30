class Bill < ApplicationRecord
  scope :settled, -> { where(settled: true) }
  scope :unsettled, -> { where(settled: false) }

  has_many :user_debts
  has_many :debtors, through: :user_debts, source: :user

  belongs_to :owner, class_name: 'User', foreign_key: 'user_id'  # Owner of the bill

  # Validations
  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :name, presence: true
end
