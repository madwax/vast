#version 330

//----UNIFORMS----
uniform uint TIME;

uniform mat4 PERSPECTIVE_MATRIX;
uniform mat4 CAMERA_MATRIX;
uniform mat4 CAMERA_INVERSE_MATRIX;
uniform mat4 MODEL_MATRIX;

//uniform vec4 LIGHT_VECTOR[16];
//uniform vec4 LIGHT_COLOUR[16];

//uniform vec4 MATERIAL_DATA;
//uniform int MATERIAL_EFFECTS;

uniform sampler2D TEXTURE_TEXTURE;

//----INPUTS----
smooth in vec4 F_W_POSITION;
smooth in vec3 F_W_COLOUR;
smooth in vec2 F_W_UV;
smooth in vec4 F_W_NORMAL;
smooth in vec4 F_M_POSITION;
smooth in vec4 F_M_NORMAL;

//----OUTPUTS----
layout (location = 0) out highp vec4 COLOUR_BUFFER;

//----GLOBALS----
vec3 COLOUR = vec3(1.0, 1.0, 1.0);

vec3 W_NEW_POSITION;
vec3 W_NEW_NORMAL;

vec4 LIGHT_VECTOR[16];
vec4 LIGHT_COLOUR[16];

//Find the type of the light
int getLightType(int light)
{
	if (LIGHT_VECTOR[light].w == 1.0)
		return 1;
	else
		return 0;
}

//Find the vector of the light
vec3 getLightVector(int light)
{
	if (getLightType(light) == 1) //It's a point light
		return normalize(W_NEW_POSITION - LIGHT_VECTOR[light].xyz);
	else //It's a directional light
		return normalize(LIGHT_VECTOR[light].xyz);
}

//Find the colour of the light
vec3 getLightColour(int light)
{
	return LIGHT_COLOUR[light].xyz;
}

//Find the ambiance factor of the light
vec3 getLightAmbiance(int light)
{
	return getLightColour(light) * LIGHT_COLOUR[light].w;
}

//Find the diffuse factor of the light
vec3 getLightDiffuse(int light)
{
	return getLightColour(light) * max(0.0, dot(-W_NEW_NORMAL, getLightVector(light)));
}

vec3 getLightSpecular(int light)
{
	float smoothness = 10.0;//MATERIAL_DATA[0];
	float shininess = 0.5;//MATERIAL_DATA[1];
	
	vec3 E = normalize((CAMERA_INVERSE_MATRIX * vec4(0.0, 0.0, 1.0, 0.0)).xyz);
	
	vec3 R = reflect(getLightVector(light), W_NEW_NORMAL);
	
	float specular = max(0.0, dot(E, R));
	
	specular = pow(specular, smoothness);
	
	return getLightColour(light) * specular * shininess;
}

vec4 getTextureValue()
{
	//No proper texture has been loaded in, so revert to colours
	if (textureSize(TEXTURE_TEXTURE, 0) == ivec2(1, 1))
		return vec4(1.0, 1.0, 1.0, 1.0);

	if (F_W_UV == vec2(-1.0, -1.0)) //If there's no texture
		return vec4(1.0, 1.0, 1.0, 1.0);
	else //It's got a texture!
		return vec4(F_W_COLOUR, 1.0) * texture2D(TEXTURE_TEXTURE, vec2(F_W_UV)).rgba;
}

vec3 getTextureColour()
{
	return F_W_COLOUR * getTextureValue().rgb;
}

void main()
{
	//Initialise the specular and diffuse
	vec3 ambiance = vec3(0.0);
	vec3 diffuse  = vec3(0.0);
	vec3 specular = vec3(0.0);
	
	LIGHT_VECTOR[0] = vec4(1.0, 1.0, 0.0, 0.0);
	LIGHT_COLOUR[0] = vec4(0.85, 0.85, 1.0, 0.3);

	//Find the modified values
	W_NEW_POSITION = normalize(F_W_POSITION.xyz);
	W_NEW_NORMAL = normalize(F_W_NORMAL.xyz);

	//Loop through all the lights
	for (int count = 0; count < 1; count ++)
	{
		//Find the direction and colour of each light
		vec3 vector = getLightVector(count);

		if (getLightColour(count) != vec3(0.0, 0.0, 0.0)) //If the light is actually a light
		{
			float multiplier = 1.0;

			if (LIGHT_VECTOR[count].w == 1.0) //Decrease brightness with distance
			{
				multiplier = min(1.0, 5.0 / pow(distance((F_W_POSITION).xyz, LIGHT_VECTOR[count].xyz), 1.5));
			}

			specular += getLightSpecular(count) * multiplier;
			ambiance += getLightAmbiance(count) * multiplier;
			diffuse += getLightDiffuse(count) * multiplier;
		}
	}

	COLOUR = getTextureColour() * (ambiance + diffuse + specular);
	
	COLOUR_BUFFER = vec4(COLOUR, getTextureValue().a);
}
