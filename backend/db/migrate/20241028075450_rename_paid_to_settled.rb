class RenamePaidToSettled < ActiveRecord::Migration[7.2]
  def change
    rename_column :bills, :paid, :settled
    rename_column :user_debts, :paid, :settled
  end
end
