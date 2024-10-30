class UserDebt < ApplicationRecord
  belongs_to :user
  belongs_to :bill

  # Validations
  validates :amount_owed, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :settled, inclusion: { in: [true, false] }

  after_save :update_debt

  scope :settled, -> { where(settled: true) }
  scope :unsettled, -> { where(settled: false) }

  private

  def update_debt
    all_settled = bill.user_debts.all? { |debt| debt.settled? }
    bill.update(settled: true) if all_settled
  end
end
