# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Clear existing users to avoid duplication if seeding multiple times
User.destroy_all

# Create sample users
User.create!([
               { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', password: 'password123' },
               { first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', password: 'password123' },
               { first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com', password: 'password123' }
             ])

puts "Created #{User.count} users."