class RenameDescriptionToName < ActiveRecord::Migration[7.2]
  def change
    rename_column :bills, :description, :name
  end
end
