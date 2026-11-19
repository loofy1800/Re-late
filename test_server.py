import unittest
from unittest.mock import patch

import server


class VehicleCatalogTests(unittest.TestCase):
    @patch("server.request_ninjas")
    def test_collection_fetches_every_page(self, request_ninjas):
        request_ninjas.side_effect = [
            [{"name": f"Make {index}"} for index in range(100)],
            [{"name": "Last Make"}]
        ]

        results = server.fetch_ninjas_collection("carmakes", {})

        self.assertEqual(len(results), 101)
        self.assertEqual(request_ninjas.call_count, 2)
        self.assertEqual(request_ninjas.call_args_list[1].args[1]["offset"], 100)

    @patch("server.request_ninjas")
    def test_image_lookup_only_returns_api_ninjas_images(self, request_ninjas):
        request_ninjas.return_value = [
            {"image_url": "https://example.com/image.jpg"},
            {"image_url": "https://media.api-ninjas.com/cars/image.png"}
        ]

        self.assertEqual(
            server.fetch_ninjas_image("Toyota", "Camry", "2025"),
            "https://media.api-ninjas.com/cars/image.png"
        )

    @patch("server.request_ninjas")
    def test_image_lookup_returns_none_when_no_image_exists(self, request_ninjas):
        request_ninjas.return_value = [{"image_url": None}]

        self.assertIsNone(server.fetch_ninjas_image("Toyota", "Camry", "2025"))

    @patch("server.request_ninjas")
    def test_collection_rejects_malformed_items(self, request_ninjas):
        request_ninjas.return_value = [{"unexpected": "item"}]

        with self.assertRaises(ValueError):
            server.fetch_ninjas_collection("carmakes", {})


if __name__ == "__main__":
    unittest.main()
