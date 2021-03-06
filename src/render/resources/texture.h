#ifndef VAST_RENDER_RESOURCES_TEXTURE_H
#define VAST_RENDER_RESOURCES_TEXTURE_H

//----LIBRARY----
#include "SFML/Graphics.hpp"

//----LOCAL----
#include "render/bufferable.h"
#include "common/generics.h"
#include "resource.h"

#include "image.h"

namespace Vast
{
	namespace Render
	{
		namespace Resources
		{
			class Shader;
			
			class Texture : public Bufferable, public Resource
			{
				private:
					sf::Image internal_image;
				public:
					Texture();
					virtual ~Texture();

					Texture(uint16 width, uint16 height, const uint8* pixels = nullptr);
					void create(uint16 width, uint16 height, const uint8* pixels = nullptr);

					//We use flip-flags because some textures (such as normal maps) expect to
					//be flipped in various non-standard ways (don't ask me why).
					Texture(std::string filename, unsigned char flip_flags = 0b00000010);
					bool loadFromFile(std::string filename, unsigned char flip_flags = 0b00000010);

					sf::Vector2u getSize();
					void setSize(sf::Vector2u size);
					
					const uint8* getPixelData();
					Pixel getPixel(uint16 x, uint16 y);
					void setPixel(uint16 x, uint16 y, Pixel pixel);
					
					void bindTo(uint16 texture_slot);
					void bindToWithUniform(uint16 texture_slot, std::string uniform_name, Shader& shader);

					void buffer(bool force = false) override;
			};
		}
	}
}

#endif
