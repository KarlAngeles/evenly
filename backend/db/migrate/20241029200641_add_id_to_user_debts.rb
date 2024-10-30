class AddIdToUserDebts < ActiveRecord::Migration[7.2]
  def change
    add_column :user_debts, :id, :primary_key
  end
end
