require "rails"

module Frontend
  class BaseGenerator < ::Rails::Generators::Base
    def base
      p 'base'
       # TODO: 別レポにしたす
      `git clone --depth 1 -b frontend/basic git@github.com:pocke777/rails-frontend-starter.git ./frontend`
    end
  end

  class ReactGenerator < ::Rails::Generators::Base
    def react
      p 'react'
    end
  end
end
